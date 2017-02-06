const request = require('request')
const http = require('http')
const server = require('../configs/server.js')

module.exports = (opt, cb, token, jsonType) => {
  const _opt = Object.assign({}, opt);
  _opt.headers = {}

  _opt.url = server.apiUrl.url+':'+server.apiUrl.port + '/api' +_opt.url;

  if (_opt.form) {
    _opt.method = 'post';
  }

  if (!_opt.method) {
    _opt.method = 'get';
  }

  if (token) {
    _opt.headers['token'] = token;
  }

  if (jsonType) {
    _opt.headers['content-type'] = 'application/json';
  }

  request[_opt.method](_opt, (err, _res, body) => {
    if (body) {
      const _body = JSON.parse(body);
      
      cb(_body);
    }

  })
}