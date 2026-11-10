const { platformSelect } = require('nativewind/theme');

const { primitive, semantic, typography, radius } = require('./design-tokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
  // 'media'(기본값)면 NativeWind 웹 런타임이 colorScheme.set을 호출하다 에러를 던진다.
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    // 색은 디자인 시스템 토큰만 쓴다(Tailwind 기본 팔레트 대체).
    // 예) text-object-boldest, bg-surface-deeper, border-stroke-subtle, bg-accent-bold, bg-theme-red-bold, bg-violet-500
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: primitive.base[0],
      black: primitive.base[1000],
      ...Object.fromEntries(Object.entries(primitive).filter(([name]) => name !== 'base')),
      ...semantic,
    },
    extend: {
      fontFamily: {
        sans: ['Pretendard'],
        mono: [platformSelect({ ios: 'Menlo', android: 'monospace', default: 'monospace' })],
      },
      // semantic/radius/16 → rounded-16 (기존 rounded-lg 등도 그대로 쓸 수 있다)
      borderRadius: Object.fromEntries(
        Object.entries(radius).map(([name, value]) => [name, `${value}px`]),
      ),
      // 텍스트 스타일. 디자인 명칭 title/6 → text-title-6
      fontSize: Object.fromEntries(
        Object.entries(typography).map(([name, [size, lineHeight, letterSpacing]]) => [
          name,
          [`${size}px`, { lineHeight: `${lineHeight}px`, letterSpacing: `${letterSpacing}px` }],
        ]),
      ),
    },
  },
  plugins: [],
};
