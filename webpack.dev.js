const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const wwwData = 'dev';// Site dir on server (relative to this config)

module.exports = {
	mode: "development",
	devtool:"source-map",
	devServer: {
		contentBase: path.join(__dirname, wwwData),
		publicPath: '/',
	},
	entry: {
		index: './src/index.js'
	},
	output:
	{
		path: path.resolve(__dirname, wwwData),
		filename: '[name].js',
		publicPath: './',
	},
	plugins: [
		new CleanWebpackPlugin(),
		new CopyWebpackPlugin([
			// {from: './assets/img/decks', to: './assets/img/decks', context: './src'},
			{from: './assets/locales', to: './assets/locales', context: './src'},
		]),
		new HtmlWebpackPlugin({
			title: 'Test Application',
			template: './src/index.html',
		}),
	],
	module:
		{
			rules:
				[
					{
						test: /\.(png|jpe?g|gif|svg)$/,
						include: path.resolve(__dirname, './src/assets/img'),
						use: [
							{
								loader: 'url-loader',
								options: {
									context: 'src', name:'[path][name].[ext]',
									limit: 128,
								}
							},
						],
					},
				]
		},
};