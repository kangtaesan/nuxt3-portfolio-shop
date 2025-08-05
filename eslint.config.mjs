// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  // Your custom configs here
  rules: {
    // npm install -D prettier eslint-plugin-prettier eslint-config-prettier
    'no-console': 'off',
    'prettier/prettier': ['error', {
      singleQuote: true,
      semi: false,
      useTabs: false,
      tabWidth: 2,
      // trailingComma: 'all',
      trailingComma: 'es5',
      printWidth: 80,
      bracketSpacing: true,
      arrowParens: 'avoid',
    }],
    semi: ['error', 'never'],
  },
})
