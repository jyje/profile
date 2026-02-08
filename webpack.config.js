const { readFileSync } = require("fs");
const { resolve } = require("path");

const { BannerPlugin, EnvironmentPlugin } = require("webpack");

const { merge } = require("webpack-merge");
const mode = process.env.NODE_ENV || "production";

const { name: filename, version } = require("./package.json");

const banner = readFileSync(resolve("./_includes/header.txt"), "utf-8");

const ASSET_PATH = '/assets/js/'

const envConfig = (() => {
  switch (mode) {
    case "production":
      return {
        devtool: false,
        plugins: [
          new BannerPlugin({ banner, raw: true }),
          new EnvironmentPlugin({
            DEBUG: false,
            ASSET_PATH,
            GET_CLAPS_API: 'https://worker.getclaps.app',
          }),
        ],
      };

    default:
      return {
        devtool: "source-map",
        plugins: [
          new EnvironmentPlugin({
            DEBUG: true,
            ASSET_PATH,
            GET_CLAPS_API: 'https://worker.getclaps.dev',
          }),
        ],
      };
  }
})()

const sharedPreset = {
  modules: false,
  useBuiltIns: "entry",
  corejs: 3,
}

const babelPresetModern = {
  babelrc: false,
  presets: [
    [
      "@babel/preset-env",
      {
        ...sharedPreset,
        targets: {
          esmodules: true,
        },
      },
    ],
  ],
}

const sharedConfig = {
  entry: resolve("./_js/src/entry.js"),
  output: {
    path: resolve("./assets/js"),
    publicPath: ASSET_PATH,
  },
  resolve: {
    modules: [
      resolve("./_js"),
      resolve("./node_modules"),
      ...process.env.NODE_PATH ? [resolve(process.env.NODE_PATH)] : [],
    ],
    extensions: [".json", ".js"],
    symlinks: true,
    fallback: {
      path: require.resolve("path-browserify"),
    },
  },
  module: {
    rules: [{
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    }],
  },
  optimization: {
    splitChunks: {
      // chunks: 'all',
      // minSize: 30000,
      // maxSize: 0,
      // minChunks: 1,
      // maxAsyncRequests: 5,
      // maxInitialRequests: 3,
      // automaticNameDelimiter: '~',
      // automaticNameMaxLength: 30,
      // name: true,
      // cacheGroups: {
      //   vendors: {
      //     test: /[\\/]node_modules[\\/]/,
      //     priority: -10
      //   },
      //   default: {
      //     minChunks: 2,
      //     priority: -20,
      //     reuseExistingChunk: true
      //   }
      // }
    }
  }
}

module.exports = [
  merge(
    envConfig,
    sharedConfig,
    {
      output: {
        filename: `${filename}-${version}.js`,
        chunkFilename: `[name]-${filename}-${version}.js`,
      },
      module: {
        rules: [{
          test: /(\.jsx|\.js)$/,
          loader: "babel-loader",
          options: babelPresetModern,
        }, {
          test: /modernizr-custom/,
          use: 'null-loader'
        }, {
          test: /@webcomponents\/(template|url|webcomponents-platform)/,
          use: 'null-loader'
        }],
      },
    },
  ),
  // Search worker build
  merge(
    envConfig,
    {
      entry: resolve("./_js/src/pro/search.worker.js"),
      output: {
        path: resolve("./assets/js"),
        filename: `search-worker-${version}.js`,
        publicPath: ASSET_PATH,
      },
      resolve: {
        modules: [
          resolve("./_js"),
          resolve("./node_modules"),
          ...process.env.NODE_PATH ? [resolve(process.env.NODE_PATH)] : [],
        ],
        extensions: [".json", ".js"],
        symlinks: true,
        fallback: {
          path: require.resolve("path-browserify"),
        },
      },
      module: {
        rules: [{
          test: /(\.jsx|\.js)$/,
          resolve: {
            fullySpecified: false,
          },
          loader: "babel-loader",
          options: babelPresetModern,
        }],
      },
    },
  ),
];
