/** @type {import('stylelint').Config} */
export default {
    extends: ["stylelint-config-standard"],
    rules: {
        "import-notation": "string",
        "at-rule-no-unknown": [true, {
            ignoreAtRules: ["theme", "source", "custom-variant"],
        }],
    },
};
