module.exports = [
  {
    ignores: ['dist', 'node_modules', 'pharmcare-app', 'uploads']
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs'
    }
  }
]
