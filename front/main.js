import Vue from 'vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import VueModal from 'vue-modal-plugin'
import VuePagination from 'vue-pagination'

import drog from './services/vue.drag-and-drop.js'



import App from './App'
import routes from './helper/router'

import directives from './directives'
import { requestHandler, auth } from './services'

// css
import './styles/less/Importing'

Vue.use(drog)
Vue.use(VueRouter)
Vue.use(VueResource)
Vue.use(VueModal)
Vue.use(VuePagination, {
  tagName: 'vue-pagination'
})

// http Settings

const router = new VueRouter()

if (!localStorage.getItem('whiteList')) {
  const list = ['/login'];
  localStorage.setItem('whiteList', JSON.stringify(list));
}

router.beforeEach((transition) => {
  auth.checkAuth();

  if (!auth.user.authenticated) {
    router.go('login');
    transition.next();
  } else { // 用户权限获得，正常操作
    Vue.http.headers.common['token'] = localStorage.getItem('token')

    const isWhiteList = (path) => {
      for (let i of JSON.parse(localStorage.getItem('whiteList'))) {
        if (path === i) {
          return true;
        }
      }

      return false;
    }


    // 判断是否是白名单上的路由
    if (isWhiteList(transition.to.path)) {
      transition.next();
    } else {

      router.go('/')
      transition.next();
    }
        
  }
})
routes(router);

router.start(App, '#app')