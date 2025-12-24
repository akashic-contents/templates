const globals = require("globals");
const warnGlobalMathRule  = require("@akashic/eslint-config/rules/warn-global-math.js");

module.exports = [
  {
    languageOptions: {
      globals: {
          ...globals.commonjs,
          window: "readable",
          g: "readable",
      },
      ecmaVersion: 6,
      sourceType: "module",
    },
    plugins: {
      "akashic": {
				rules: {
					"warn-global-math": warnGlobalMathRule
				}
			}
    },
    rules: {
      "no-dupe-args": "error",
      "no-dupe-keys": "error",
      "no-duplicate-case": "error",
      "no-inner-declarations": "error",
      "no-irregular-whitespace": ["error", {
          skipStrings: true,
          skipComments: true,
          skipRegExps: true,
          skipTemplates: true
      }],
      "no-undef": "error",
      "akashic/warn-global-math": "warn"
    }
  }
];
