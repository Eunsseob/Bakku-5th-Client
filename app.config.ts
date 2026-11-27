import type { ConfigContext, ExpoConfig } from 'expo/config';

// 네이버 로그인이 끝나고 앱으로 돌아올 iOS URL scheme. 네이버 개발자센터의 iOS URL Scheme 과 같아야 한다.
// 앱 기본 scheme(bakku)과 겹치면 bakku:// 링크가 모두 네이버 로그인으로 넘어가므로 따로 둔다.
// login.tsx 의 serviceUrlSchemeIOS 와 같은 값이어야 한다.
const NAVER_LOGIN_URL_SCHEME = 'bakkunaverlogin';

const kakaoAppKey = process.env.EXPO_PUBLIC_KAKAO_APP_KEY?.trim();
if (!kakaoAppKey) {
  console.warn('EXPO_PUBLIC_KAKAO_APP_KEY 가 없어 카카오 로그인 네이티브 설정을 건너뜁니다.');
}

// app.json 의 설정에 .env 값이 필요한 네이티브 설정을 더한다 (app.json 은 환경 변수를 읽지 못한다).
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  plugins: [
    ...(config.plugins ?? []),
    // iOS: 카카오톡 · 네이버 앱 로그인 후 돌아오는 URL 처리 (kakao-login · naver-login 보다 앞에 둔다)
    ['./plugins/withSocialLoginOpenUrl', { naverUrlScheme: NAVER_LOGIN_URL_SCHEME }],
    // 카카오 로그인: 네이티브 앱 키 · kakao{앱키} 리다이렉트 scheme · 카카오톡 앱 로그인 설정
    ...(kakaoAppKey
      ? [['@react-native-seoul/kakao-login', { kakaoAppKey }] as [string, object]]
      : []),
    // 네이버 로그인(iOS): 네이버 앱 로그인 scheme 조회 · 로그인 후 돌아올 URL scheme
    ['@react-native-seoul/naver-login', { urlScheme: NAVER_LOGIN_URL_SCHEME }],
    // 네이버 지도: 지도 키를 AndroidManifest / Info.plist 에 넣고 위치 권한을 추가한다
    [
      '@mj-studio/react-native-naver-map',
      {
        client_id: process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID,
        android: { ACCESS_FINE_LOCATION: true, ACCESS_COARSE_LOCATION: true },
      },
    ],
    // 네이버 지도 Android SDK 는 네이버 전용 Maven 저장소에서 받는다
    [
      'expo-build-properties',
      { android: { extraMavenRepos: ['https://repository.map.naver.com/archive/maven'] } },
    ],
  ],
});
