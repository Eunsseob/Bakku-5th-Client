import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { useAuthStore } from '@/shared/api/useAuthStore';
import { socialLogin } from '../api/socialLogin';
import { useSignupStore } from '../store/useSignupStore';
import { enterMainAfterAuth } from '../utils/enterMainAfterAuth';
import LoginLayout from './LoginLayout';

export default function Login() {
  const router = useRouter();
  const authenticate = async (provider: 'kakao' | 'naver', token: string) => {
    const { signupToken, accessToken, refreshToken, deviceId } = await socialLogin(provider, token);
    const signup = useSignupStore.getState();
    if (signupToken) {
      signup.reset();
      signup.setSignupSession({ signupToken, deviceId });
      useAuthStore.getState().clear();
      router.push('/(auth)/terms');
      return;
    }
    if (accessToken && refreshToken) {
      signup.reset();
      useAuthStore.getState().setTokens({ accessToken, refreshToken }, deviceId);
      enterMainAfterAuth();
      return;
    }
    throw new Error('서버에서 로그인 정보를 받지 못했습니다.');
  };
  const handleKakaoLogin = async () => {
    try {
      const { login } = await import('@react-native-seoul/kakao-login');
      const { accessToken } = await login();
      await authenticate('kakao', accessToken);
    } catch (error: unknown) {
      Alert.alert(
        '카카오 로그인 실패',
        error instanceof Error ? error.message : '잠시 후 다시 시도해 주세요.',
      );
    }
  };
  const handleNaverLogin = async () => {
    try {
      const consumerKey = process.env.EXPO_PUBLIC_NAVER_CLIENT_ID;
      const consumerSecret = process.env.EXPO_PUBLIC_NAVER_CLIENT_SECRET;
      if (!consumerKey || !consumerSecret) {
        Alert.alert(
          '네이버 로그인',
          '네이버 로그인 Client ID와 Client Secret 설정을 확인해 주세요.',
        );
        return;
      }
      const { default: NaverLogin } = await import('@react-native-seoul/naver-login');
      NaverLogin.initialize({
        appName: 'Bakku',
        consumerKey,
        consumerSecret,
        serviceUrlSchemeIOS: 'bakku',
        disableNaverAppAuthIOS: true,
      });
      const { successResponse, failureResponse } = await NaverLogin.login();
      if (successResponse?.accessToken) {
        await authenticate('naver', successResponse.accessToken);
        return;
      }
      if (failureResponse?.isCancel) return;
      Alert.alert('네이버 로그인 실패', failureResponse?.message ?? '잠시 후 다시 시도해 주세요.');
    } catch (error: unknown) {
      Alert.alert(
        '네이버 로그인 실패',
        error instanceof Error ? error.message : '잠시 후 다시 시도해 주세요.',
      );
    }
  };
  return <LoginLayout onKakao={handleKakaoLogin} onNaver={handleNaverLogin} />;
}
