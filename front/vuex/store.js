import Vue from 'vue'
import Vuex from 'vuex'

import alert from './module/alert'
import barList from './module/barList'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    alert,
    barList
  }
})