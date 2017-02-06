var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var TransferWebpackPlugin = require('transfer-webpack-plugin');
var vue = require('vue-loader');


var webpackConfig = {
  entry: ['./front/index.js'],
  output: {
    path: path.resolve('./server/dist'),
    publicPath: '/dist/',
    filename: 'bundle.js',
  },
  module: {
    noParse: [/plotly.js/],
    loaders: [
      {
        loader: 'vue-loader',
        test: /\.vue/,
        exclude: /node_modules/
      },
      {
        loader: 'babel-loader',
        test: /\.js/,
        exclude: /node_modules/
      },
      {
        test: /\.(css|less)/,
        loader: ExtractTextPlugin.extract('style', 'css-loader!less-loader'),
        exclude: /node_modules/
      },
      {
        loader:  'url-loader?limit=50000&name=images/[name].[ext]',
        test: /\.(jpe?g|png|gif)/
      },
      {
        loader: "url-loader?limit=10000&minetype=application/font-woff",
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/
      },
      {
        loader:  'url-loader?limit=50000&name=images/[name].[ext]',
        test: /\.(wav)/
      },
      { 
        loader: "file-loader",
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/
      },
      {
        test: require.resolve('jquery'),
        loader: 'expose?jQuery!expose?$'
      }
    ]
  },
  vue: {
    css: ExtractTextPlugin.extract("css"),
    less: ExtractTextPlugin.extract('vue-style-loader', 'css!less'),
    js: 'babel?optional[]=runtime&stage=0'
  },
  resolve: {
    extensions: ['', '.js', '.vue', '.less']
  },
  externals: {
    'AMap': 'AMap'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: __dirname + '/server/template/product.ejs',
      hash: true,
      filename: __dirname + '/server/views/index.ejs',
      inject: 'body'
    }),
    new ExtractTextPlugin('main.css'),
    new webpack.optimize.UglifyJsPlugin({
      mangle: {
        except: ['$', 'exports', 'require']
      }
    }),
    new webpack.NoErrorsPlugin(),
  ]
};

if (process.env.NODE_ENV === 'devlopment') {
  var config = require('./server/configs/index.js');

  var publicPath = config.server.serverUrl.url + ':' + config.server.serverUrl.port +'/dist/';
  var hotMiddlewareScript = 'webpack-hot-middleware/client?reload=true';

  webpackConfig.entry.push(hotMiddlewareScript);
  webpackConfig.output['publicPath'] = publicPath;
  webpackConfig.devtool = 'source-map';
  webpackConfig.plugins = [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new ExtractTextPlugin('main.css')
  ];
}

module.exports = webpackConfig;