import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
// 만약 Expo Go에서 테스트 중이라면 네이버 로그인이 에러를 낼 수 있으므로 안전하게 처리
import { getProfile, login as kakaoLogin } from '@react-native-seoul/kakao-login';
import NaverLogin from '@react-native-seoul/naver-login';
// 혹은 카카오 SDK 내부 함수로 현재 앱이 뿜어내는 실제 키 해시 확인

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    try {
      NaverLogin.initialize({
        appName: 'Bakku',
        consumerKey: process.env.EXPO_PUBLIC_NAVER_CLIENT_ID!,
        consumerSecret: process.env.EXPO_PUBLIC_NAVER_CLIENT_SECRET!,
        serviceUrlSchemeIOS: 'bakku',
        disableNaverAppAuthIOS: true,
      });
    } catch (e) {
      console.log('[NAVER] initialize 실패:', e);
    }
  }, []);

  const handleNaverLogin = async () => {
  console.log('[NAVER] 로그인 시도');
  console.log('[NAVER] id:', process.env.EXPO_PUBLIC_NAVER_CLIENT_ID);
  try {
    const { successResponse, failureResponse } = await NaverLogin.login();

    if (successResponse) {
      console.log('[NAVER] accessToken:', successResponse.accessToken);
      console.log('[NAVER] 전체 응답:', JSON.stringify(successResponse, null, 2));
      Alert.alert('네이버 로그인 성공', `토큰: ${successResponse.accessToken.slice(0, 10)}...`);
      router.push('/terms');
      return;
    }

    Alert.alert('네이버 로그인 실패', failureResponse?.message ?? '알 수 없는 오류');
  } catch (e) {
    Alert.alert('네이버 로그인 에러', String(e));
  }
};

const handleKakaoLogin = async () => {
  console.log('[KAKAO] ▶ 로그인 시도');

  try {
    const token = await kakaoLogin();

    console.log('[KAKAO] 토큰 응답 키:', Object.keys(token));

    if (__DEV__) {
      console.log('[KAKAO] accessToken:', token.accessToken);
    }

    const profile = await getProfile();

    console.log('[KAKAO] ✅ 프로필 조회 성공');
    console.log('[KAKAO] 프로필:', JSON.stringify(profile, null, 2));

    Alert.alert(
      '카카오 로그인 성공',
      `${profile.nickname ?? ''}님 환영합니다`
    );

    router.push('/terms');
  } catch (e: any) {
    console.log('[KAKAO] message:', e?.message);
    console.log('[KAKAO] code:', e?.code);
    console.log(
      '[KAKAO] 전체 에러:',
      JSON.stringify(e, Object.getOwnPropertyNames(e ?? {}), 2)
    );

    Alert.alert(
      '카카오 로그인 에러',
      `${e?.code ?? ''}\n${e?.message ?? String(e)}`
    );
  }
};

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">Login</Text>

      <Pressable
        className="mt-6 rounded-lg bg-blue-500 px-4 py-3"
        onPress={() => router.push("/terms")}
      >
        <Text className="text-white">약관동의 (화면 이동 테스트)</Text>
      </Pressable>

      <Pressable
        className="mt-3 rounded-lg bg-[#03C75A] px-4 py-3"
        onPress={handleNaverLogin}
      >
        <Text className="text-white">네이버로 로그인</Text>
      </Pressable>
      <Pressable
        className="mt-3 rounded-lg bg-[#FEE500] px-4 py-3"
        onPress={handleKakaoLogin}
      >
        <Text className="text-black">카카오로 로그인</Text>
      </Pressable>
    </View>
  );
}