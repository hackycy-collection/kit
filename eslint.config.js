// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'lib',
    ignores: ['./playground/package.json'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      'yaml/sort-keys': 'off',
    },
  },
)
