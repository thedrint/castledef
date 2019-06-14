const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const wwwData = 'public';
const srcData = './src';

module.exports = {
	mode: "production",
	entry: {
		index: `${srcData}/index.js`
	},
	output:
	{
		path: path.resolve(__dirname, wwwData),
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
			{from: './assets/locales', to: './assets/locales', context: srcData},
		]),
		new HtmlWebpackPlugin({
			title: 'CastleDef',
			// template: './src/index.html',
			favicon: `${srcData}/favicon.ico`,
		}),
	],
	module:
	{
		rules:
		[
			{
				test: /\.(png|jpe?g|gif|svg)$/,
				include: path.resolve(__dirname, `${srcData}/assets/img`),
				use: [
					{
						loader: 'url-loader',
						options: {
							context: srcData, name:'[path][name].[ext]',
							limit: 128,
						},
					},
				],
			},
		],
	},
};