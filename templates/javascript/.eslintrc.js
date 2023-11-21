module.exports = {
  "env": {
    "commonjs": true
  },
  "parserOptions": {
    ecmaVersion: 6,
    sourceType: "module"
  },
  "globals": {
    "window": false,
    "g": false
  },
  "rules": {
    "no-dupe-args": "error",
    "no-dupe-keys": "error",
    "no-duplicate-case": "error",
    "no-inner-declarations": "error",
    "no-irregular-whitespace": ["error", {
      "skipStrings": true,
      "skipComments": true,
      "skipRegExps": true,
      "skipTemplates": true
    }],
    "no-undef": "error"
  }
}
