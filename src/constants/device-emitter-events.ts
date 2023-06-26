export enum DeviceEmitterEvents {
  /**
   * Triggered when the root navigator is ready and navigation.navigate can be safely used.
   */
  APP_NAVIGATION_READY = 'APP_NAVIGATION_READY',

  /**
   * Triggered when all initialization data has been loaded, but before the bootsplash screen has faded.
   */
  APP_DATA_INITIALIZED = 'APP_DATA_INITIALIZED',

  /**
   * Triggered after data initialization and after the bootsplash animation is complete.
   */
  APP_INIT_COMPLETED = 'APP_INIT_COMPLETED',

  /**
   * Triggered when the user has completed app onboarding.
   */
  APP_ONBOARDING_COMPLETED = 'APP_ONBOARDING_COMPLETED',

  /**
   * Triggered when certain conditions are fulfilled and the app is safe to navigate to a deeplinked screen.
   */
  APP_READY_FOR_DEEPLINKS = 'APP_READY_FOR_DEEPLINKS',

  /**
   * Triggered when Dosh SDK has finished initialization.
   */
  DOSH_INITIALIZED = 'DOSH_INITIALIZED',

  /**
   * Triggered when app is loading transaction history.
   */
  WALLET_LOAD_HISTORY = 'WALLET_LOAD_HISTORY',

  /**
   * Triggered when app is updating the user's wallet balance.
   */
  WALLET_BALANCE_UPDATED = 'WALLET_BALANCE_UPDATED',
}
