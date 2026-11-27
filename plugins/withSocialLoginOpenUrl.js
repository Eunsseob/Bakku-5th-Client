// 카카오톡 · 네이버 앱으로 로그인한 뒤 앱으로 돌아오는 URL 을 각 SDK 에 넘기는 iOS 설정.
//
// SDK 58 템플릿의 AppDelegate.swift 에는 application(_:open:options:) 가 없어서
// @react-native-seoul/kakao-login · naver-login 의 config plugin 이 URL 처리 코드를 넣지 못한다.
// (scene 라이프사이클이라 URL 은 ExpoAppSceneDelegate 가 받아 AppDelegate 의 이 메서드로 넘겨준다.)
// 또 kakao-login plugin 이 넣는 Swift 코드는 internal 클래스(RNKakaoLogins)를 불러 컴파일되지 않으므로
// 카카오 SDK(KakaoSDKAuth)를 직접 부르는 메서드를 넣고, 라이브러리가 넣은 줄은 지운다.
//
// app.config.ts 의 plugins 에서 kakao-login · naver-login 보다 앞에 둔다.
// (mod 는 나중에 등록한 plugin 부터 실행되므로 앞에 두면 라이브러리 plugin 다음에 실행된다.)
const { withAppDelegate } = require('expo/config-plugins');

const MARKER = '// bakku: social-login-open-url';
const LIBRARY_KAKAO_LINE =
  'if kakao_login.RNKakaoLogins.isKakaoTalkLoginUrl(url) { return kakao_login.RNKakaoLogins.handleOpen(url) }';

const addSwiftImport = (contents, moduleName) =>
  new RegExp(`^import ${moduleName}$`, 'm').test(contents)
    ? contents
    : contents.replace(/^((?:internal )?import Expo)$/m, `$1\nimport ${moduleName}`);

const openUrlMethod = (naverUrlScheme) => `
  ${MARKER}
  public override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    if AuthApi.isKakaoTalkLoginUrl(url) {
      return AuthController.handleOpenUrl(url: url)
    }
    if url.scheme == "${naverUrlScheme}" {
      return NaverThirdPartyLoginConnection.getSharedInstance().application(app, open: url, options: options)
    }
    return super.application(app, open: url, options: options)
  }
`;

/** @type {import('expo/config-plugins').ConfigPlugin<{ naverUrlScheme: string }>} */
const withSocialLoginOpenUrl = (config, { naverUrlScheme }) =>
  withAppDelegate(config, (mod) => {
    if (mod.modResults.language !== 'swift') {
      throw new Error('withSocialLoginOpenUrl 은 Swift AppDelegate 만 지원합니다.');
    }
    let contents = mod.modResults.contents
      .split('\n')
      .filter((line) => !line.includes(LIBRARY_KAKAO_LINE) && line.trim() !== 'import kakao_login')
      .join('\n');
    contents = addSwiftImport(contents, 'KakaoSDKAuth');
    contents = addSwiftImport(contents, 'NaverThirdPartyLogin');
    if (!contents.includes(MARKER)) {
      if (/func application\(\s*_ app: UIApplication,\s*open url: URL/.test(contents)) {
        throw new Error(
          'AppDelegate 에 이미 application(_:open:options:) 가 있어 넣지 않았습니다.',
        );
      }
      const classStart = contents.search(/class AppDelegate\b[^{]*\{/);
      if (classStart < 0) throw new Error('AppDelegate 클래스를 찾지 못했습니다.');
      // 클래스 본문의 첫 메서드 앞(변수 선언 다음)에 넣는다
      const firstFunc = contents.indexOf('\n  public override func application(', classStart);
      if (firstFunc < 0) throw new Error('AppDelegate 의 didFinishLaunching 을 찾지 못했습니다.');
      contents =
        contents.slice(0, firstFunc) + openUrlMethod(naverUrlScheme) + contents.slice(firstFunc);
    }
    mod.modResults.contents = contents;
    return mod;
  });

module.exports = withSocialLoginOpenUrl;
