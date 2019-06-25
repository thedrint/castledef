const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const dstDir = 'public';
const srcDir = './src';

module.exports = {
	mode: "production",
	entry: {
		index: `${srcDir}/index.js`
	},
	output:
	{
		path: path.resolve(__dirname, dstDir),
		filename: '[name].js',
		publicPath: './',
	},
	optimization: {
		minimizer: [
			new TerserPlugin({
				extractComments: /^foo$/,
			}),
		],
	},
	plugins: [
		new CleanWebpackPlugin(),
		new CopyWebpackPlugin([
			{from: './assets/locales', to: './assets/locales', context: srcDir},
		]),
		new HtmlWebpackPlugin({
			title: 'CastleDef',
			// template: './src/index.html',
			favicon: `${srcDir}/favicon.ico`,
		}),
	],
	module:
	{
		rules:
		[
			{
				test: /\.(png|jpe?g|gif|svg)$/,
				include: path.resolve(__dirname, `${srcDir}/assets/img`),
				use: [
					{
						loader: 'url-loader',
						options: {
							context: srcDir, name:'[path][name].[ext]',
							limit: 128,
						},
					},
				],
			},
		],
	},
};