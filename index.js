/*
  Copyright 2018 Esri
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

const CopyWebpackPlugin = require("copy-webpack-plugin");
const DojoWebpackPlugin = require("dojo-webpack-plugin");
const HasJsPlugin = require("webpack-hasjs-plugin");

const webpack = require("webpack");
const path = require("path");

const requiredPlugins = require("./lib/requiredPlugins");

module.exports = class ArcGISPlugin {
  /**
   * Initialize the plugin
   * @constructor
   * @param {Object} [options] -(optional) The options for the ArcGIS Webpack Plugin
   * @param {boolean} [options.useDefaultAssetLoaders] - (optional) Let the plugin manage how image, svg, and fonts are loaded
   * @param {Array.<string>} [options.locales] - (optional) Which locales to include in build, leave empty to support all locales
   * @param {Object} [options.options] - (optional) - Override the dojo-webpack-plugin options used by the ArcGIS Webpack Plugin
   */
  constructor(options = {}) {
    this.options = {
      useDefaultAssetLoaders: true,
      globalContext: path.join(__dirname, "node_modules", "arcgis-js-api"),
      environment: {
        root: options.root || "."
      },
      buildEnvironment: {
        root: "node_modules"
      }
    };
    this.options = { ...this.options, ...options.options };
    if (!this.options.loaderConfig) {
      this.options.loaderConfig = require("./lib/loaderConfig");
    }
  }
  
  apply(compiler) {
    compiler.options.module.rules = compiler.options.module.rules || [];
    compiler.options.module.rules.push({
      test: /@dojo/,
      use: "umd-compat-loader"
    });
    if (this.options.useDefaultAssetLoaders) {
      compiler.options.module.rules.push({
        test: /arcgis-js-api([\\]+|\/).*.(jpe?g|png|gif|webp)$/,
        loader: "url-loader",
        options: {
          // Inline files smaller than 10 kB (10240 bytes)
          limit: 10 * 1024,
        }
      });
      compiler.options.module.rules.push({
        test: /arcgis-js-api([\\]+|\/).*.(wsv|ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "build/[name].[ext]"
            }
          }
        ]
      });
    }
    this.dojoPlugin = new DojoWebpackPlugin(this.options);
    requiredPlugins.unshift(this.dojoPlugin);
    requiredPlugins.forEach(plugin => plugin.apply(compiler));
  }
};
