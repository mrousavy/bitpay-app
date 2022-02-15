import {yupResolver} from '@hookform/resolvers/yup';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useRef, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {Keyboard, SafeAreaView, TextInput} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import styled from 'styled-components/native';
import * as yup from 'yup';
import AlertBox from '../../../components/alert-box/AlertBox';
import Button from '../../../components/button/Button';
import BoxInput from '../../../components/form/BoxInput';
import haptic from '../../../components/haptic-feedback/haptic';
import {Link} from '../../../components/styled/Text';
import {Network} from '../../../constants';
import {BASE_BITPAY_URLS} from '../../../constants/config';
import {navigationRef, RootStacks} from '../../../Root';
import {RootState} from '../../../store';
import {BitPayIdActions, BitPayIdEffects} from '../../../store/bitpay-id';
import {Session} from '../../../store/bitpay-id/bitpay-id.models';
import {LoginStatus} from '../../../store/bitpay-id/bitpay-id.reducer';
import {sleep} from '../../../utils/helper-methods';
import {BitpayIdScreens} from '../../bitpay-id/BitpayIdStack';
import {AuthStackParamList} from '../AuthStack';
import AuthFormContainer, {
  AuthActionRow,
  AuthActionsContainer,
  AuthActionText,
  AuthRowContainer,
} from '../components/AuthFormContainer';
import RecaptchaModal, {CaptchaRef} from '../components/RecaptchaModal';

export type LoginSignupParamList = {
  context: 'login' | 'signup';
  onLoginSuccess?: ((...args: any[]) => any) | undefined;
};

type LoginSignupScreenProps = StackScreenProps<
  AuthStackParamList,
  'LoginSignup'
>;

const Row = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const schema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

interface LoginFormFieldValues {
  email: string;
  password: string;
}

const LoginSignup: React.FC<LoginSignupScreenProps> = ({navigation, route}) => {
  const dispatch = useDispatch();
  const {
    control,
    handleSubmit,
    getValues,
    formState: {errors},
  } = useForm<LoginFormFieldValues>({resolver: yupResolver(schema)});
  const network = useSelector<RootState, Network>(({APP}) => APP.network);
  const session = useSelector<RootState, Session>(
    ({BITPAY_ID}) => BITPAY_ID.session,
  );
  const loginStatus = useSelector<RootState, LoginStatus>(
    ({BITPAY_ID}) => BITPAY_ID.loginStatus,
  );
  const loginError = useSelector<RootState, string>(
    ({BITPAY_ID}) => BITPAY_ID.loginError || '',
  );
  const [isCaptchaModalVisible, setCaptchaModalVisible] = useState(false);
  const passwordRef = useRef<TextInput>(null);
  const captchaRef = useRef<CaptchaRef>(null);
  const {context, onLoginSuccess} = route.params;

  useEffect(() => {
    dispatch(BitPayIdEffects.startFetchSession());
  }, [dispatch]);

  useEffect(() => {
    if (loginStatus === 'success') {
      dispatch(BitPayIdActions.completedPairing());

      if (onLoginSuccess) {
        onLoginSuccess();
        return;
      }

      const parentNav = navigation.getParent();

      if (parentNav?.canGoBack()) {
        parentNav.goBack();
      } else {
        navigationRef.navigate(RootStacks.BITPAY_ID, {
          screen: BitpayIdScreens.PROFILE,
        });
      }

      return;
    }

    if (loginStatus === 'failed') {
      // TODO
      captchaRef.current?.reset();
      return;
    }

    if (loginStatus === 'twoFactorPending') {
      navigation.navigate('TwoFactorAuthentication');
      return;
    }

    if (loginStatus === 'emailAuthenticationPending') {
      navigation.navigate('EmailAuthentication');
      return;
    }
  }, [loginStatus, navigation, dispatch, onLoginSuccess]);

  const onSubmit = handleSubmit(({email, password}) => {
    Keyboard.dismiss();
    if (session.captchaDisabled) {
      dispatch(BitPayIdEffects.startLogin({email, password}));
    } else {
      setCaptchaModalVisible(true);
    }
  });

  const onTroubleLoggingIn = () => {
    // TODO
    console.log('trouble logging in');
  };

  const onCaptchaResponse = async (gCaptchaResponse: string) => {
    const {email, password} = getValues();
    setCaptchaModalVisible(false);
    await sleep(500);
    dispatch(BitPayIdEffects.startLogin({email, password, gCaptchaResponse}));
  };

  const onCaptchaCancel = () => {
    haptic('notificationWarning');
    setCaptchaModalVisible(false);
  };

  return (
    <SafeAreaView>
      <AuthFormContainer>
        {loginStatus === 'failed' ? (
          <AuthRowContainer>
            <AlertBox type="warning">
              {loginError ||
                'Could not log in. Please review your information and try again.'}
            </AlertBox>
          </AuthRowContainer>
        ) : null}

        <AuthRowContainer>
          <Controller
            control={control}
            render={({field: {onChange, onBlur, value}}) => (
              <BoxInput
                placeholder={'satoshi@example.com'}
                label={'EMAIL'}
                onBlur={onBlur}
                onChangeText={(text: string) => onChange(text)}
                error={errors.email?.message}
                value={value}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
              />
            )}
            name="email"
            defaultValue=""
          />
        </AuthRowContainer>

        <AuthRowContainer>
          <Controller
            control={control}
            render={({field: {onChange, onBlur, value}}) => (
              <BoxInput
                ref={passwordRef}
                placeholder={'strongPassword123'}
                label={'PASSWORD'}
                type={'password'}
                onBlur={onBlur}
                onChangeText={(text: string) => onChange(text)}
                error={errors.password?.message}
                value={value}
                onSubmitEditing={onSubmit}
              />
            )}
            name="password"
            defaultValue=""
          />
        </AuthRowContainer>

        <AuthActionsContainer>
          <AuthActionRow>
            <Button onPress={onSubmit}>
              {context === 'login' ? 'Log In' : 'Create Account'}
            </Button>
          </AuthActionRow>

          {context === 'login' ? (
            <>
              <AuthActionRow>
                <AuthActionText>
                  Don't have an account?{' '}
                  <Link
                    onPress={() => {
                      navigation.navigate('CreateAccount');
                    }}>
                    Create Account
                  </Link>
                </AuthActionText>
              </AuthActionRow>

              <AuthActionRow>
                <AuthActionText>
                  <Link onPress={() => onTroubleLoggingIn()}>
                    Trouble logging in?
                  </Link>
                </AuthActionText>
              </AuthActionRow>
            </>
          ) : (
            <>
              <AuthActionRow>
                <Row>
                  <AuthActionText>
                    Already have an account?{' '}
                    <Link
                      onPress={() => {
                        navigation.setParams({context: 'login'});
                      }}>
                      Log In
                    </Link>
                  </AuthActionText>
                </Row>
              </AuthActionRow>
            </>
          )}
        </AuthActionsContainer>

        <RecaptchaModal
          isVisible={isCaptchaModalVisible}
          ref={captchaRef}
          sitekey={session.noCaptchaKey}
          baseUrl={BASE_BITPAY_URLS[network]}
          onResponse={onCaptchaResponse}
          onCancel={onCaptchaCancel}
        />
      </AuthFormContainer>
    </SafeAreaView>
  );
};

export default LoginSignup;
