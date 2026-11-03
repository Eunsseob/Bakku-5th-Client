const { platformSelect } = require('nativewind/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard'],
        mono: [platformSelect({ ios: 'Menlo', android: 'monospace', default: 'monospace' })],
      },
      // 텍스트 스타일 (Product 기준). 디자인 명칭 title/6 → text-title-6
      fontSize: {
        'title-6': ['40px', { lineHeight: '52px' }],
        'title-5': ['32px', { lineHeight: '42px' }],
        'title-4': ['28px', { lineHeight: '36px' }],
        'title-3': ['24px', { lineHeight: '32px' }],
        'title-2': ['20px', { lineHeight: '26px' }],
        'title-1': ['18px', { lineHeight: '24px' }],
        'label-lg': ['16px', { lineHeight: '22px' }],
        'label-md': ['14px', { lineHeight: '20px' }],
        'label-sm': ['12px', { lineHeight: '18px' }],
        'label-xs': ['11px', { lineHeight: '16px' }],
        'label-2xs': ['10px', { lineHeight: '14px' }],
        'body-lg': ['16px', { lineHeight: '26px' }],
        'body-md': ['15px', { lineHeight: '24px' }],
        'body-sm': ['14px', { lineHeight: '22px' }],
        'body-xs': ['13px', { lineHeight: '20px' }],
        'body-2xs': ['12px', { lineHeight: '19px' }],
        'syntax-lg': ['16px', { lineHeight: '22px' }],
        'syntax-md': ['14px', { lineHeight: '20px' }],
        'syntax-sm': ['13px', { lineHeight: '18px' }],
        'syntax-xs': ['12px', { lineHeight: '16px' }],
      },
      // 브랜드 컬러. 단계 없이 쓰면(bg-bp) DEFAULT인 대표색(400)이 적용된다.
      colors: {
        // 디자인 시스템 회색 (Tailwind v4 gray). 기본 gray 팔레트를 대체한다.
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DC',
          400: '#99A1AF',
          500: '#6A7282',
          600: '#4A5565',
          700: '#364153',
          800: '#1E2939',
          900: '#101828',
          950: '#030712',
        },
        // Bubblegum Pink
        bp: {
          DEFAULT: '#FF5FA2',
          50: '#FEF2F6',
          100: '#FDE6F0',
          200: '#FECDE1',
          300: '#FFA4C9',
          400: '#FF5FA2',
          500: '#FA2A83',
          600: '#E6005F',
          700: '#C60047',
          800: '#A3003B',
          900: '#870B35',
          950: '#52021B',
        },
        // Gacha Blue
        gb: {
          DEFAULT: '#4AA8F5',
          50: '#EFF6FE',
          100: '#DBEBFC',
          200: '#BDDDFB',
          300: '#8DC8F8',
          400: '#4AA8F5',
          500: '#0088F3',
          600: '#006EDB',
          700: '#005CC2',
          800: '#0049A5',
          900: '#0B3F87',
          950: '#102852',
        },
        // Lime Pop
        lp: {
          DEFAULT: '#C8F03C',
          50: '#FCFEEA',
          100: '#F7FDD0',
          200: '#EDFBA4',
          300: '#DDF866',
          400: '#C8F03C',
          500: '#A9D831',
          600: '#84AC24',
          700: '#65821A',
          800: '#526813',
          900: '#475719',
          950: '#253008',
        },
      },
    },
  },
  plugins: [],
};
