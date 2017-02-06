import Index from '../pages/index'
import Setting from '../pages/setting'
import Login from '../pages/login'
import Station from '../pages/station'
import Log from '../pages/log'
import originData from '../pages/originData'
import originCheck from '../pages/originCheck'
import originSupply from '../pages/originSupply'
import originHistory from '../pages/originHistory'
import originReverse from '../pages/originReverse'


import person from '../pages/template/person'
import user from '../pages/template/user'
import station from '../pages/template/station'
import functions from '../pages/template/functions'
import others from '../pages/template/others'
import factor from '../pages/template/factor'
import alarm from '../pages/template/alarm'


export default (router) => {
  router.map({
    '/login': {
      component: Login
    },
    '/': {
      component: Index
    },
    '/station': {
      component: Station
    },
    '/alarm': {
      component: Log
    },
    '/data-raw': {
      component: originData
    },
    '/data-append': {
      component: originSupply
    },
    '/data-update': {
      component: originCheck
    },
    '/data-history': {
      component: originHistory
    },
    '/data-reset': {
      component: originReverse
    },
    '/setting': {
      component: Setting,
      subRoutes: {
        '/profile': {
          component: person
        },
        '/user': {
          component: user
        },
        '/station': {
          component: station
        },
        '/alarm-policy': {
          component: alarm
        },
        '/sys': {
          component: others
        },
        '/feature': {
          component: functions
        },
        '/factor': {
          component: factor
        }
      }
    },
  })

  router.redirect({
    '*': '/',
  })
}