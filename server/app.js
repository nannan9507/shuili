const express = require('express')
const session = require('express-session')
const http = require('http')
const path = require('path')
const favicon = require('static-favicon')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const multer = require('multer')


const config = require('./configs/index.js')

// development module

const app = express()

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5000');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

// app.all('*', function (req, res, next) {
//   console.log(req)
// });


// view
app.set('views', path.join(__dirname, 'views'))

app.set('download', path.join(__dirname, 'download'))

// 开发环境
if (process.env.NODE_ENV === 'devlopment') {
  const webpack = require('webpack')
  const webpackDevMiddleware = require('webpack-dev-middleware')
  const webpackHotMiddleware = require('webpack-hot-middleware')
  const webpackConfig = require('../webpack.config.js')

  const bs = require('browser-sync')
  app.set('views', path.join(__dirname, 'template'))
  app.use(express.static(path.join(__dirname, 'dist')))

  const compiler = webpack(webpackConfig)

  app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    noInfo: true,
    stats: {
      colors: true
    }
  }))

  app.use(webpackHotMiddleware(compiler))
}

app.set('view engine', 'ejs')
// static
app.use(express.static(path.join(__dirname, '')))
// port
app.set('port', config.server.serverUrl.port)
// bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('secret'));
// session
app.use(session());
// route
const Router = require( './controllers/index')
Router(app)

// server start
const server = http.createServer(app)

if (process.env.NODE_ENV === 'devlopment') {
  const reload = require('reload')

  reload(server, app);
}

server.listen(app.get('port'), () => {
  console.log(`server on port ${ app.get('port') }`);
});