import Vue from 'vue'

import { requestHandler } from '../services'
// import { SHOW_ALERT, HIDE_ALERT, HELLO } from './mutations'
// import { SHOW_NAVBAR, HIDE_NAVBAR } from './mutations'
import { CLEAN_BAR_LIST, GET_BAR_LIST } from './mutations'


const makeAction = (type, url) => {
  return ({ dispatch }, ...args) => dispatch(type, ...args)
}


// 获取到的数据
// let navBarList = [
//   {
//     name: '实时监控',
//     url: '/',
//   },
//   {
//     name: '监测站点',
//     url: '/station',
//     navSelect: [
//       {
//         name: '最新数据',
//       },
//       {
//         name: '曲线分析',
    
//       },
//       {
//         name: '报表统计',
    
//       },
//       {
//         name: '站点资料',
    
//       },
//       {
//         name: '通讯日志',
    
//       },
//       {
//         name: '站点用户',
//         icon: '',
    
//       },
//       {
//         name: '运维记录',
//         icon: '',
    
//       }
//     ]
//   },
//   {
//     url: '/warn-log',
//     name: '告警日志'
//   }
// ]

// let sideBarList = [
//   {
//     name: '个人',
//     url: '/setting/person',
//     navSelect: [
//       {
//         name: '基本信息'
//       },
//       {
//         name: '修改密码'
//       }
//     ]
//   },
//   {
//     name: '用户',
//     url: '/setting/user',
//     navSelect: [
//       {
//         name: '用户管理',
    
//       },
//       {
//         name: '角色管理',
//       }
//     ]
//   }
// ]


export const getBarList = ({ dispatch }, navBarList, sideBarList) => {
  for (let i of navBarList) {
    if (i.sub && i.sub.length > 0) {
      i.open = false;
    }
    i.active = false;
  }

  for (let i of sideBarList) {
    i.active = false;
  }

  dispatch(GET_BAR_LIST, navBarList, sideBarList);
}

export const cleanBarList = ({ dispatch }) => {
  dispatch(CLEAN_BAR_LIST);
}


// // method1: 写在action.js里
// export const hello = ({ dispatch }) => {
//   requestHandler('getUser', { params: { id: 15 } }).then((res) => {
//     dispatch(HELLO, 123456)
//   })
// }

// // method2: 写在页面上
// export const showAlert = makeAction(SHOW_ALERT)
// export const hideAlert = makeAction(HIDE_ALERT)