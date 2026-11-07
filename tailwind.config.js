const { platformSelect } = require('nativewind/theme');

const { primitive, semantic, typography } = require('./design-tokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
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
