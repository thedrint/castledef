const path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const dstDir = './';
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
		new CleanWebpackPlugin({
			// dry:true,
			cleanOnceBeforeBuildPatterns: [
				'index.html', 
				'index.js*', 
				'favicon.ico', 
				'assets/*', //'!assets/img/decks/**', // exclude decks
			],
		}),
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
			{
				test: /\.(css)$/,
				// include: path.resolve(__dirname, srcDir),
				use: [
					'style-loader',
					'css-loader',
				],
			},
		],
	},
};
