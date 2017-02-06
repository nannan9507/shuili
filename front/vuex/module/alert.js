import {
  SHOW_ALERT,
  HIDE_ALERT,
  HELLO
} from '../mutations'

const state = {
  show: false,
  type: 'alert',
  message: 'default',
  onSure: null,
  onCliose: null
}


const mutations = {
  [SHOW_ALERT](state, data) {
    state.message = data.message;
    // data.show = true
    // state.alert = data
  },
  [HIDE_ALERT](state) {
    state.show = false
  },
  [HELLO](state, value) {
    state.aaa = value;
    console.log(state)
  }
}

export default {
  state,
  mutations
}