module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    // Add custom rules here
    'prettier/prettier': [
     'error',
      {
        "endOfLine": "auto"
      }
    ],

    "@typescript-eslint/no-explicit-any": "off"
    // 'line-comment-postion': 'above',
  },
  globals: {
    "document": false
  },
  env: {
    "browser": true,
  },
  ignorePatterns: ['vite.config.js', '/dist/'],
};
