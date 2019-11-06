const path = require('path');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = {
	entry: {
		operator: './src/js/operator/index.js',
		plugin: './src/js/plugin/index.js',
		dialog: './src/scss/dialog.scss'
	},
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'js/[name].js',
		libraryExport: 'default',
		libraryTarget: 'umd',
		library: 'plug'
	},
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /node_modules/,
				use: ['babel-loader', 'eslint-loader']
			},
			{
				test: /\.s?css$/,
				use: [
					MiniCssExtractPlugin.loader, 'css-loader',
					'postcss-loader', 'sass-loader'
				]
			}
		]
	},
	plugins: [
		new FixStyleOnlyEntriesPlugin(),
		new MiniCssExtractPlugin({
			filename: 'css/[name].css'
		})
	],
	optimization: {
		minimizer: [
			new UglifyJsPlugin({
				parallel: true
			}),
			new OptimizeCSSAssetsPlugin()
		]
	}
};
