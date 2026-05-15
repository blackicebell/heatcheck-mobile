import expo from "eslint-config-expo/flat.js";

export default [
  ...expo,
  {
    ignores: ["dist", "node_modules"],
    rules: {
      "import/namespace": "off",
      "import/export": "off",
      "import/no-named-as-default": "off",
      "import/no-named-as-default-member": "off",
      "import/no-duplicates": "off",
      "import/no-unresolved": "off",
    },
  },
];
