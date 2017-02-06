import {
  GET_BAR_LIST
} from '../mutations'

const state = {
  sideBar: [],
  navBar: [],
  whiteList: ['/login', '/setting']
}

const mutations = {
  [GET_BAR_LIST](state, navBar, sideBar) {
    state.navBar = navBar;
    state.sideBar = sideBar;

    // 生成数据
    localStorage.setItem('navList', JSON.stringify(state.navBar))
    localStorage.setItem('sideList', JSON.stringify(state.sideBar))

    for(let i of navBar) {
      state.whiteList.push(i.url)
      if (i.sub && i.sub.length > 0) {
        for (let j of i.sub) {
          state.whiteList.push(j.url);
        }
      }
    }

    for(let i of sideBar) {
      state.whiteList.push(i.url)
    }

    localStorage.setItem('whiteList', JSON.stringify(state.whiteList))
  },
}

export default {
  state,
  mutations
}