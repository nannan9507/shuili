<template>
<div class="container login">
  <div class="loginbox">
    <h2>登录水质监测系统</h2>
    <form>
      <input type="text" placeholder="用户名" v-model="username" />
      <div class="input-field">
        <input type="password" placeholder="密码" v-model="password" />
        <!-- <div class="text"><a href="javascript:;">忘记了？</a></div> -->
      </div>
      <div class="label-field">
        <label>
          <input type="checkbox" id="remeber" v-model="remeberMe" />
          <div class="text">三天内免登录</div>
        </label>
      </div>

      <div class="warning" v-show="warning.show">
        {{ warning.text }}
      </div>

      <div v-if="showVcode" style="margin-top: 10px;">
        <image style="float: left; cursor: pointer;" :src="src" @click="fresh" /> 
        <input type="text" style="float: left; margin-left: 20px; margin-top: 0; width: 150px; height: 50px; font-size: 20px;" v-model="vcode" />
      </div>

      <Button @click="login(username, password, remeberMe, vcode)" text="登录"></Button>
    </form>
  </div>
  <footer v-if="company_name">{{ company_name }}版权所有</footer>
<div>
</template>

<script>

import { auth, requestHandler } from '../services'
import Button from '../components/Button'

import { getBarList } from '../vuex/actions'


export default {
  vuex: {
    actions: {
      getBarList
    }
  },
  components: {
    Button,
    // ValiCode
  },
  data() {
    return {
      username: '',
      password: '',
      vcode: '',
      remeberMe: true,
      warning: {
        show: false,
        text: ''
      },
      button: {
        disabled: true
      },
      company_name: '',
      src: '/apis/user/vcode',
      showVcode: false
    }
  },
  ready() {
    window.addEventListener('keyup', (ev) => {
      if (ev.keyCode === 13) {
        this.login(this.username, this.password, this.remeberMe, this.vcode);
      }
    })
  },
  methods: {
    login(username, password, remeberMe, vcode) {
      if (this.showVcode) {
        this.user = {
          username: username,
          password: password,
          remeberMe: remeberMe,
          vcode: vcode
        }
      } else {
        this.user = {
          username: username,
          password: password,
          remeberMe: remeberMe
        }
      }

      auth.login(this, this.user, '/');
    },
    fresh() {
      this.src = '/apis/user/vcode?nocache='+new Date().getTime();
    }
  },
  route: {
    data() {
      this.$dispatch('hideNavbar');
    },
    activate() {
      let sys_name;
      let company_name;
      if (localStorage.getItem('sys_name') && localStorage.getItem('company_name')) {
        sys_name = localStorage.getItem('sys_name');
        company_name = localStorage.getItem('company_name');
      }

      const timer = setTimeout(() => {
        if (sessionStorage.getItem('warning')) {
          new Promise((resolve, reject) => {
            resolve();
          }).then(() => {
            this.$dispatch('Warning:dispatch', '您的帐号超过登录时间，请重新登录', 'fail');
          }).then(() => {
            sessionStorage.clear();
            clearTimeout(timer);
          })
        } else {
          sessionStorage.clear();
          clearTimeout(timer);
        }
      }, 500);
      
      
      localStorage.clear();

      if (sys_name) {
        localStorage.setItem('sys_name', sys_name);
        document.title = sys_name;
      }

      if (company_name) {
        localStorage.setItem('company_name', company_name);
        this.company_name = company_name;
      }

      const list = ['/login'];
      localStorage.setItem('whiteList', JSON.stringify(list));

    },
    deactivate() {
      this.$dispatch('reSendBarList');
      this.$dispatch('showNavbar');
    }
  }
}
</script>