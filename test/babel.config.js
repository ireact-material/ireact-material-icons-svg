module.exports = function getBabelConfig(api) {
  const useESModules = api.env(["legacy", "modern", "stable", "rollup"]);

  const presets = [
    [
      "@babel/preset-env",
      {
        bugfixes: true,
        browserslistEnv: process.env.BABEL_ENV || process.env.NODE_ENV,
        debug: process.env.MUI_BUILD_VERBOSE === "true",
        modules: useESModules ? false : "commonjs",
        shippedProposals: api.env("modern"),
      },
    ],
    [
      "@babel/preset-react",
      {
        runtime: "automatic",
      },
    ],
    "@babel/preset-typescript",
  ];

  const plugins = [["babel-plugin-macros"]];

  return {
    assumptions: {
      noDocumentAll: true,
    },
    presets,
    plugins,
    ignore: [/@babel[/\\|]runtime/], // Fix a Windows issue.
    overrides: [
      {
        exclude: /\.test\.(js|ts|tsx)$/,
        plugins: ["@babel/plugin-transform-react-constant-elements"],
      },
    ],
    env: {
      coverage: {
        plugins: ["babel-plugin-istanbul"],
      },
      legacy: {
        plugins: [
          // IE11 support
          "@babel/plugin-transform-object-assign",
        ],
      },
    },
  };
};
