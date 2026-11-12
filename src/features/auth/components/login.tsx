import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { USE_MOCK_AUTH } from '@/constants/auth';
import LoginLayout from './LoginLayout';

export default function Login() {
  const router = useRouter();
  const goToMain = () => {
    router.replace('../home');
  };
  const handleKakaoLogin = async () => {
    if (USE_MOCK_AUTH) {
      goToMain();
      return;
    }
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
  const handleOtherLogin = (provider: string) => {
    if (USE_MOCK_AUTH) router.push('/(auth)/terms');
    else Alert.alert(`${provider} 로그인`, '로그인 연동을 준비 중이에요.');
  };
  return (
    <LoginLayout
      onKakao={handleKakaoLogin}
      onGoogle={() => handleOtherLogin('Google')}
    />
  );
}
