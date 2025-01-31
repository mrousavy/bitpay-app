import {requestTrackingPermission} from 'react-native-tracking-transparency';
import {Effect} from '..';
import {APP_ANALYTICS_ENABLED, APP_VERSION} from '../../constants/config';
import {BrazeWrapper} from '../../lib/Braze';
import {MixpanelWrapper} from '../../lib/Mixpanel';
import {LogActions} from '../log';

const getTrackingAuthorizedByUser =
  (): Effect<Promise<boolean>> => dispatch => {
    return requestTrackingPermission()
      .then(status => {
        return ['authorized', 'unavailable'].includes(status);
      })
      .catch(err => {
        dispatch(
          LogActions.error(
            'An error occurred while requesting tracking permission',
          ),
        );

        dispatch(
          LogActions.error(
            err instanceof Error ? err.message : JSON.stringify(err),
          ),
        );

        return false;
      });
  };

export const Analytics = (() => {
  let _preInitQueue: Array<() => void> = [];
  let _isInitialized = false;
  let _isTrackingAuthorized = false;

  const guard = (cb: () => void) => {
    if (!APP_ANALYTICS_ENABLED) {
      return;
    }

    if (!_isInitialized) {
      // Queue up any actions that happen before we get a chance to initialize.
      _preInitQueue.push(cb);
      return;
    }

    cb();
  };

  return {
    /**
     * Initialize the analytics SDK(s) before use.
     *
     * @returns Promise<void>
     */
    initialize: (): Effect<Promise<void>> => async dispatch => {
      if (_isInitialized) {
        return;
      }

      if (APP_ANALYTICS_ENABLED) {
        _isTrackingAuthorized = await dispatch(getTrackingAuthorizedByUser());

        await BrazeWrapper.init()
          .then(() => {
            dispatch(LogActions.debug('Successfully initialized Braze SDK.'));
          })
          .catch(err => {
            const errMsg =
              err instanceof Error ? err.message : JSON.stringify(err);

            dispatch(
              LogActions.debug('Failed to initialize Braze SDK.', errMsg),
            );
          });

        // Force App Version
        const superProperties = {app_version_string: APP_VERSION};
        await MixpanelWrapper.init(!_isTrackingAuthorized, superProperties)
          .then(() => {
            dispatch(
              LogActions.debug('Successfully initialized Mixpanel SDK.'),
            );
          })
          .catch(err => {
            const errMsg =
              err instanceof Error ? err.message : JSON.stringify(err);

            dispatch(
              LogActions.debug('Failed to initialize Mixpanel SDK.', errMsg),
            );
          });
      }

      _isInitialized = true;

      dispatch(LogActions.info('Successfully initialized analytics.'));

      return;
    },

    /**
     * Makes a call to identify a user through the analytics SDK.
     *
     * @param userEid BitPay EID for this user.
     * @param traits An object of known user attributes. Things like: email, name, plan, etc.
     * @param onComplete A function to run once the identify event has been successfully sent.
     */
    identify:
      (
        userEid: string | undefined,
        traits?: Record<string, any> | undefined,
      ): Effect<void> =>
      () => {
        if (_isTrackingAuthorized) {
          BrazeWrapper.identify(userEid, traits);
          MixpanelWrapper.identify(userEid);
        } else {
          // require EID for functionality
          BrazeWrapper.identify(userEid);
        }
      },

    /**
     * Send an event through the analytics SDK when a screen has been viewed.
     *
     * @param name The name of the screen being viewed.
     * @param properties An object of properties for the screen view event.
     * @param onComplete A function to run once the screen event has been successfully sent.
     */
    screen:
      (
        name: string,
        properties: Record<string, any> = {},
        onComplete?: () => void,
      ): Effect<any> =>
      () => {
        guard(async () => {
          if (_isTrackingAuthorized) {
            BrazeWrapper.screen(name, properties);
            MixpanelWrapper.screen(name, properties);
          }

          onComplete?.();
        });
      },

    /**
     * Send an event through the analytics SDK when the user has performed an action.
     *
     * @param event The name of the event you're tracking. Recommended to use human-readable names like `Played a Song` or `Updated Status`.
     * @param properties An object of event properties. If the event was 'Added to Shopping Cart', it might have properties like price, productType, etc.
     * @param onComplete A function to run once the tracking event has been successfully sent.
     */
    track:
      (
        event: string,
        properties: Record<string, any> = {},
        onComplete?: () => void,
      ): Effect<void> =>
      () => {
        guard(async () => {
          const eventName = `BitPay App - ${event}`;

          if (_isTrackingAuthorized) {
            BrazeWrapper.track(eventName, properties);
            MixpanelWrapper.track(eventName, properties);
          }

          onComplete?.();
        });
      },
  };
})();
