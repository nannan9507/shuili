'use strict';
const express = require ('express')
const ccap = require ('ccap')
const qs = require('qs')

const httpProxy = require('../../helpers/httpProxy')


const router = express.Router()


router.get('/vcode', (req, res) => {
  let _ccap = ccap({
    width:125,
    height:50,
    offset:30,
    quality:100,
    fontsize:40
  });

  var ary = _ccap.get();
  var txt = ary[0].substring(0, 4);
  var buf = ary[1];

  req.session['vcode'] = txt;
  res.writeHead(200, { 'Content-Type': 'image/jpeg' });
  res.end(buf, 'binary');
})


router.post('/login', (req, res) => {
  if (req.session.loginTimes >= 0) {
    req.session.loginTimes++;
  } else {
    req.session.loginTimes = 0
  }

  // 如果session存了验证码
  if (req.session.vcode) {
    if (req.body.vcode && req.body.vcode.toLowerCase() === req.session.vcode.toLowerCase()) { // 验证通过则提交
      httpProxy({
        method: 'post',
        url: '/login',
        body: JSON.stringify({
          username: req.body.username,
          password: req.body.password,
          rememberme: req.body.remeberMe
        })
      }, (cb) => {
        if (cb.success) {
          req.session.loginTimes = 0;
          cb['openVcode'] = false;
          req.session.vcode = null;
        } else {
          if (req.session.loginTimes > 2) {
            cb['openVcode'] = true;
          } else {
            cb['openVcode'] = false;
          }
        }

        res.json(cb);
      }, null, true)
    } else { // 不通过则报验证码错误信息
      res.json({ success: false, openVcode: true, message: '验证码错误' })
    }
  } else {  // 错误在两次以内，正常请求
    httpProxy({
      method: 'post',
      url: '/login',
      body: JSON.stringify({
        username: req.body.username,
        password: req.body.password,
        rememberme: req.body.remeberMe
      })
    }, (cb) => {
      if (cb.success) {
        req.session.loginTimes = 0;
        cb['openVcode'] = false;
        req.session.vcode = null;
      } else {
        if (req.session.loginTimes > 2) {
          cb['openVcode'] = true;
        } else {
          cb['openVcode'] = false;
        }
      }

      res.json(cb);
    }, null, true);
  }

})


router.post('/', (req, res) => {
  httpProxy({
    method: 'post',
    url: '/users',
    form: {
      username: req.body.username,
      password: req.body.password,
      roles: req.body.role,
      dept_id: req.body.department,
      label_name: req.body.name,
      mobile: req.body.phone
    },
  }, (cb) => {
    res.json(cb);
  }, req.headers.token);
})


router.get('/role/:id', (req, res) => {
  httpProxy({
    method: 'get',
    url: '/users/'+req.params.id+'/role/'
  }, (cb) => {
    res.json(cb)
  }, req.headers.token)
})


router.put('/role/:id', (req, res) => {
  httpProxy({
    method: 'put',
    url: '/users/'+req.params.id+'/role/'
  }, (cb) => {
    res.json(cb)
  }, req.headers.token)
})


router.get('/:id', (req, res) => {
  httpProxy({
    method: 'get',
    url: '/users/'+req.params.id+'/info/'
  }, (cb) => {
    res.json(cb)
  }, req.headers.token)
})


router.put('/:id', (req, res) => {
  httpProxy({
    method: 'put',
    url: '/users/'+req.params.id+'/info/',
    body: JSON.stringify({
      roles: req.body.role,
      dept_id: req.body.department,
      label_name: req.body.name,
      mobile: req.body.phone
    })
  }, (cb) => {
    res.json(cb)
  }, req.headers.token, true)
})


router.delete('/', (req, res) => {
  httpProxy({
    method: 'delete',
    url: '/users',
    // body: JSON.stringify(req.body.list)
    body: req.body.list
  }, (cb) => {
    res.json(cb);
  }, req.headers.token, true);
})


router.put('/', (req, res) => {
  const user_id = parseInt(req.body.user_id);
  const name = req.body.name;
  const phone = req.body.phone;

  httpProxy({
    method: 'put',
    url: '/users',
    body: JSON.stringify({
      id: user_id,
      label_name: name,
      mobile: phone
    }),
  }, (cb) => {
    res.json(cb);
  }, req.headers.token, true);
})

router.put('/password/change', (req, res) => {
  const id = req.body.user_id;
  const old_password = req.body.old_password;
  const new_password = req.body.new_password;

  httpProxy({
    method: 'put',
    url: '/updatePwd',
    body: JSON.stringify({ id: parseInt(id), old_password: old_password, new_password: new_password }),
  }, (cb) => {
    res.json(cb);
  }, req.headers.token, true)
})


router.put('/pass/resetPass', (req, res) => {
  httpProxy({
    method: 'put',
    url: '/resetPwd',
    body: JSON.stringify({ id: parseInt(req.body.id) }),
  }, (cb) => {
    res.json(cb);
  }, req.headers.token, true)
})


router.get('/menu/:id', (req, res) => {
  httpProxy({
    method: 'get',
    url: '/users/'+req.params.id+'/menu',
  }, (cb) => {
    res.json(cb);
  }, req.headers.token, true)
})


router.put('/menu/:id/update', (req, res) => {
  httpProxy({
    method: 'put',
    url: '/users/'+req.params.id+'/menu',
    body: JSON.stringify({ menu_auth: req.body.menu_auth }),
  }, (cb) => {
    res.json(cb);
  }, req.headers.token, true)
})


router.get('/station/:id', (req, res) => {
  httpProxy({
    method: 'get',
    url: '/users/'+req.params.id+'/station',
  }, (cb) => {
    res.json(cb);
  }, req.headers.token, true)
})


router.put('/station/:id/update', (req, res) => {
  httpProxy({
    method: 'put',
    url: '/users/'+req.params.id+'/station',
    body: JSON.stringify({ station_auth: req.body.station_auth }),
  }, (cb) => {
    res.json(cb);
  }, req.headers.token, true)
})

module.exports = router