import Vue from 'vue'
import Router from 'vue-router'

import apis from '../helper/api.js'
import route from '../helper/router.js'


// 请求组件
export const requestHandler = (url, options, cb) => {
  if (url === '' || apis[url] === undefined) {
    return console.error('该url不存在');
  }

  const _options = Object.assign({}, options);

  if (!_options.params) {
    _options.params = {};
  }

  _options.params['headers'] = { 
    token: auth.getAuthHeader()
  }

  let _opt = {
    url: apis[url].url,
    method: apis[url].method.toLowerCase()
  };

  if (_options.query) {
    let qs = '';
    for (let i in _options.query) {
      qs = qs + i + '=' + encodeURIComponent(options.query[i]);
    }

    _opt['url'] = _opt['url'] + '?' + qs;
  }

  let func;  
  // 当有data的情况
  if (options && options.data) {
    func = Vue.http[_opt.method](_opt.url, _options.data, _options.params)
  } else {
    func = Vue.http[_opt.method](_opt.url, _options.params)
  }


  func.then((success) => {
    if (success.body.error === 'UNAUTHENTICATED') {
      const router = new Router();
      router.go('/login');
      sessionStorage.setItem('warning', 1);
    } else {
      return cb(success);
    }
  }, (error) => {
    if (error.status === 400) {
      Vue.use(Router);
      const router = new Router();
      router.go('/');
    }

    return cb(error);
  })
}


// 权限管理
export const auth = {
  user: {
    authenticated: false
  },
  login(context, creds, path) {
    let data = {
      username: creds.username,
      password: creds.password,
      remeberMe: creds.remeberMe
    }

    if (context.showVcode) {
      // 带验证码的提交
      if (!creds.vcode) {
        return context.warning.text = '验证码不允许为空';
      }

      data['vcode'] = creds.vcode;
    }

    if (data.username && data.password) {
      requestHandler('token', { params: {}, data: data }, (res) => {
        if (res.body && res.body.success) {
          localStorage.setItem('user_id', res.body.data.user_id);
          localStorage.setItem('label_name', res.body.data.label_name);
          localStorage.setItem('token', res.body.data.token);
          localStorage.setItem('settings', JSON.stringify(res.body.data.company.setting));
          this.user.authenticated = true;
          // 获取顶部权限栏
          context.showVcode = false;
          context.$dispatch('reSendLabelname');
          context.getBarList(res.body.data.menu.navList, res.body.data.menu.sideBarList);
          context.$router.go('/');
        } else {
          context.username = '';
          context.password = '';
          context.warning.show = true;
          if (res.body.message) {
            context.warning.text = res.body.message;
          }
          if (res.body.openVcode) {
            context.showVcode = true;
            context.fresh();
            context.vcode = '';
          } else {
            context.showVcode = false;
          }
        }
      })
    }
  },
  logout(context) {
    localStorage.removeItem('token');
    this.user.authenticated = false;
    context.$router.go('login')
  },
  checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
      this.user.authenticated = true;
    } else {
      this.user.authenticated = false;
    }
  },
  getAuthHeader() {
    const token = localStorage.getItem('token') || '';
    return token;
  }
}