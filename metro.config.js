const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// NativeWind 는 앱에서 1rem 을 14px 로 계산한다(기본값). Tailwind · Figma 기준(16px)과 맞추려고 16 으로 둔다.
// 예) size-8 = 32, p-1.5 = 6, h-12 = 48
module.exports = withNativeWind(config, { input: './src/global.css', inlineRem: 16 });
