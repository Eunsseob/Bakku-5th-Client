import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import LoginLayout from './LoginLayout';
import { enterMainAfterAuth } from '@/features/auth/utils/enterMainAfterAuth';

export default function Login() {
  const router = useRouter();
  const goToMain = () => {
    enterMainAfterAuth();
  };
  const handleKakaoLogin = async () => {
    try {
      const { login } = await import('@react-native-seoul/kakao-login');
      await login();
      goToMain();
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
        router.push('/(auth)/terms');
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
