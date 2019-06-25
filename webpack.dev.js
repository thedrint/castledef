const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const dstDir = 'dev';
const srcDir = './src';

module.exports = {
	mode: "development",
	devtool:"source-map",
	devServer: {
		contentBase: path.join(__dirname, dstDir),
		publicPath: '/',
	},
	entry: {
		index: `${srcDir}/index.js`
	},
	output:
	{
		path: path.resolve(__dirname, dstDir),
		filename: '[name].js',
		publicPath: './',
	},
	plugins: [
		new CleanWebpackPlugin(),
		new CopyWebpackPlugin([
			{from: './assets/locales', to: './assets/locales', context: srcDir},
		]),
		new HtmlWebpackPlugin({
			title: 'CastleDef Testing',
			// template: './src/index.html',
			favicon: `${srcDir}/favicon.ico`,
		}),
	],
	module:
	{
		rules:
		[
			{
				test: /\.(ttf|png|jpe?g|gif|svg)$/,
				include: path.resolve(__dirname, srcDir),
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