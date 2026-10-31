/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // 브랜드 컬러. 단계 없이 쓰면(bg-bp) DEFAULT인 대표색(400)이 적용된다.
      colors: {
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
