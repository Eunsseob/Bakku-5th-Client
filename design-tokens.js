// BDS(바꾸 디자인 시스템) 디자인 토큰. Figma 변수(primitive/*, semantic/*)를 그대로 옮긴 값이다.
// tailwind.config.js와 앱 코드(아이콘 color prop 등)가 함께 사용한다. 값은 Figma에서만 바꾼다.

const STEPS = [25, 50, 75, 100, 150, 200, 300, 400, 500, 600, 700, 800, 850, 900];

const scale = (hexes) => Object.fromEntries(STEPS.map((step, i) => [step, `#${hexes[i]}`]));

const primitive = {
  base: { 0: '#ffffff', 1000: '#000000' },
  // prettier-ignore
  gray: {
    ...scale(['f9f9fb', 'f2f4f6', 'eaebf0', 'dadce5', 'ced2dc', 'adb1c0', '9ea2b1', '888c9b', '727583', '555866', '464855', '2e303d', '232531', '1a1b27']),
    alpha: scale(['04045706', '00264e0d', '000a4715', '000d4b25', '00144831', '000b3a52', '000a3161', '00082877', '00051e8d', '000419aa', '000314b9', '000212d1', '000210dc', '01020fe5']),
  },
  // prettier-ignore
  red: scale(['fff7f7', 'fff1ef', 'ffe6e4', 'ffd3cf', 'ffc5bf', 'ff958d', 'ff7b77', 'ff4957', 'ec0042', 'b30030', '960026', '680018', '550012', '41000b']),
  // prettier-ignore
  orange: scale(['fff8f4', 'fff1e8', 'ffe8d9', 'ffd5ba', 'ffc7a2', 'ff9a4f', 'ff8019', 'ec6200', 'd64300', 'a23100', '872700', '5e1800', '4b1200', '3a0b00']),
  // prettier-ignore
  amber: scale(['fff8ed', 'fff2de', 'ffe9c6', 'ffd897', 'ffca6d', 'e9a700', 'd59800', 'c18000', 'a86700', '834b00', '6f3b00', '4d2700', '3e1e00', '2f1500']),
  // prettier-ignore
  yellow: scale(['fffadc', 'fff5ba', 'ffed84', 'f3de6e', 'e9d35c', 'cab300', 'baa400', 'a08d00', '867700', '665900', '544900', '393100', '2d2600', '221c00']),
  // prettier-ignore
  lime: scale(['f2ffce', 'e5ff93', 'ddf787', 'cde96f', 'c3de5e', 'a2bf00', '94af00', '7b9800', '648000', '486000', '384f00', '263600', '1d2b00', '151f00']),
  // prettier-ignore
  green: scale(['ebffe7', 'd7ffce', 'b4ffa3', '9af286', '86e871', '40cd00', '3abc00', '31a200', '278900', '1b6700', '155500', '0b3900', '072e00', '042200']),
  // prettier-ignore
  emerald: scale(['e7fff1', 'cfffe3', 'a4ffcf', '88f2bc', '75e8af', '00cc87', '00bb7b', '00a164', '008851', '006638', '00542c', '00391c', '002d15', '00210e']),
  // prettier-ignore
  teal: scale(['e4fff9', 'c9fff3', '95ffea', '7bf1db', '68e6d0', '00c9b1', '00b8a2', '009f85', '00856a', '00644b', '00533c', '003827', '002c1e', '002116']),
  // prettier-ignore
  cyan: scale(['edfcff', 'dbf9ff', 'c1f5ff', '84edff', '70e2f7', '00c4dc', '00b4ca', '009ab7', '0080a0', '00607e', '004f6b', '003449', '00293a', '001f2d']),
  // prettier-ignore
  sky: scale(['f4faff', 'e8f5ff', 'daefff', 'bbe2ff', 'a5d9ff', '52bcff', '00adfd', '0094e0', '007bc2', '005c98', '004b7f', '003258', '002747', '001d37']),
  // prettier-ignore
  blue: scale(['f6f9ff', 'eef4ff', 'e2edff', 'cbdfff', 'bad4ff', '86b4ff', '6ca4ff', '448aff', '066dff', '0051c5', '0042a4', '002c74', '00225e', '001949']),
  // prettier-ignore
  indigo: scale(['f8f9ff', 'f2f3ff', 'e9ebff', 'd7dbff', 'cad0ff', 'a6acff', '969aff', '7e7eff', '6a5eff', '5719ff', '4900dd', '31009c', '260080', '1c0064']),
  // prettier-ignore
  violet: scale(['faf8ff', 'f6f2ff', 'efe8ff', 'e4d7ff', 'dccaff', 'c4a2ff', 'b98eff', 'aa6dff', '9c43ff', '8000e0', '6a00bb', '490083', '3b006b', '2c0054']),
  // prettier-ignore
  purple: scale(['fcf7ff', 'faf0ff', 'f7e6ff', 'f1d3ff', 'ecc4ff', 'df96ff', 'd97eff', 'cf53ff', 'c200f9', '9300be', '7a009e', '54006e', '44005a', '340046']),
  // prettier-ignore
  fuchsia: scale(['fff6ff', 'ffefff', 'fee4ff', 'fdcfff', 'fcbeff', 'f888ff', 'f56aff', 'f01eff', 'ce00db', '9d00a8', '82008b', '5a0061', '49004f', '38003c']),
  // prettier-ignore
  pink: scale(['fff7fb', 'fff0f8', 'ffe5f3', 'ffd0e9', 'ffc1e3', 'ff8dd0', 'ff6fc8', 'ff2cbd', 'df00a3', 'aa007b', '8d0066', '620046', '500038', '3d002a']),
  // prettier-ignore
  rose: scale(['fff7f8', 'fff0f2', 'ffe6e9', 'ffd2d8', 'ffc3cb', 'ff93a5', 'ff7794', 'ff427e', 'e8006d', 'b00051', '920042', '67002c', '530022', '400019']),
};

// semantic/theme/<색>/* 와 semantic/accent/* 는 모두 primitive 단계에 같은 규칙으로 매핑된다.
const LEVELS = {
  boldest: 700,
  bolder: 600,
  bold: 500,
  normal: 400,
  neutral: 300,
  alternative: 200,
  assistive: 150,
  subtle: 100,
  subtler: 75,
  subtlest: 50,
};

const levels = (palette) =>
  Object.fromEntries(Object.entries(LEVELS).map(([name, step]) => [name, palette[step]]));

const HUES = [
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
];

const { gray } = primitive;

const semantic = {
  object: {
    boldest: gray[900],
    bolder: gray[850],
    bold: gray[800],
    normal: gray[700],
    neutral: gray.alpha[600],
    alternative: gray.alpha[500],
    assistive: gray.alpha[300],
    subtle: gray.alpha[200],
    subtler: gray.alpha[150],
    subtlest: gray.alpha[100],
    inverse: {
      boldest: primitive.base[0],
      bolder: gray[50],
      bold: gray[100],
      normal: gray[150],
      neutral: gray[200],
      alternative: gray[300],
      assistive: gray[400],
      subtle: gray[500],
      subtler: gray[600],
      subtlest: gray[700],
    },
  },
  accent: levels(primitive.violet),
  surface: {
    standard: primitive.base[0],
    deep: gray[25],
    deeper: gray[50],
    deepest: gray[75],
    inverse: {
      standard: gray[900],
      deep: gray[850],
      deeper: gray[800],
      deepest: gray[700],
    },
  },
  curtain: {
    dim: '#00000070',
    dimmer: '#000000a1',
  },
  stroke: {
    bold: gray[600],
    normal: gray[500],
    neutral: gray[300],
    alternative: gray[200],
    assistive: gray[150],
    subtle: gray[100],
    subtler: gray[75],
    subtlest: gray[50],
    alpha: {
      bold: gray.alpha[600],
      normal: gray.alpha[500],
      neutral: gray.alpha[300],
      alternative: gray.alpha[200],
      assistive: gray.alpha[150],
      subtle: gray.alpha[100],
      subtler: gray.alpha[75],
      subtlest: gray.alpha[50],
    },
  },
  fill: {
    boldest: gray.alpha[800],
    bolder: gray.alpha[700],
    bold: gray.alpha[600],
    normal: gray.alpha[500],
    neutral: gray.alpha[400],
    alternative: gray.alpha[300],
    assistive: gray.alpha[200],
    subtle: gray.alpha[150],
    subtler: gray.alpha[100],
    subtlest: gray.alpha[50],
  },
  system: {
    white: primitive.base[0],
    black: primitive.base[1000],
  },
  theme: Object.fromEntries(HUES.map((hue) => [hue, levels(primitive[hue])])),
};

// 텍스트 스타일: [크기, 행간, 자간] (px). 디자인 명칭 label/md → text-label-md
// title 은 Figma 변수의 모바일 모드 값(컴포넌트에 적용된 값)이다.
const typography = {
  'title-6': [40, 52, -1.04],
  'title-5': [32, 42, -0.74],
  'title-4': [28, 36, -0.56],
  'title-3': [24, 32, -0.41],
  'title-2': [20, 26, -0.28],
  'title-1': [18, 24, -0.2],
  'label-lg': [16, 22, -0.16],
  'label-md': [14, 20, -0.11],
  'label-sm': [12, 18, -0.07],
  'label-xs': [11, 16, -0.07],
  'label-2xs': [10, 14, -0.07],
  'body-lg': [16, 26, 0.02],
  'body-md': [15, 24, 0.05],
  'body-sm': [14, 22, 0.06],
  'body-xs': [13, 20, 0.06],
  'body-2xs': [12, 19, 0.07],
  'syntax-lg': [16, 22, 0],
  'syntax-md': [14, 20, 0],
  'syntax-sm': [13, 18, 0],
  'syntax-xs': [12, 16, 0],
};

// semantic/radius/* (px). 클래스: rounded-16, rounded-max
const radius = { 0: 0, 2: 2, 4: 4, 6: 6, 8: 8, 10: 10, 12: 12, 16: 16, 24: 24, 32: 32, max: 9999 };

// semantic/shadow/* (Elevation). RN 0.76+ 의 boxShadow 스타일로 쓴다. 예) style={shadow[2]}
const shadow = {
  1: { boxShadow: '0px 1px 4px 0px #01020f14' },
  2: { boxShadow: '0px 2px 10px 0px #01020f1a' },
  3: { boxShadow: '0px 4px 16px 0px #01020f1f' },
};

module.exports = { primitive, semantic, typography, radius, shadow };
