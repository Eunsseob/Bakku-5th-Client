// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: ['dist/*', '.expo/*'],
  },
  {
    rules: {
      // phosphor-react-native 루트 import는 아이콘 전체(약 6MB)를 번들에 넣는다. 타입 import는 괜찮다.
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'phosphor-react-native',
              allowTypeImports: true,
              message:
                "아이콘별 경로로 import 하세요. 예) import { HeartIcon } from 'phosphor-react-native/src/icons/Heart';",
            },
          ],
        },
      ],
    },
  },
]);
