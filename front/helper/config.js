export default {
  navList: [
    {
      name: '实时监控',
      url: '/',
      show: true
    },
    {
      name: '监测站点',
      url: '/station',
      show: true,
      navSelect: [
        {
          name: '最新数据',
          icon: 'dashboard',
          active: false
        },
        {
          name: '曲线分析',
          icon: 'weibiaoti11',
          active: false
        },
        {
          name: '报表统计',
          icon: 'tongji',
          active: false
        },
        {
          name: '站点资料',
          icon: 'iconfontxinxi',
          active: false
        },
        {
          name: '通讯日志',
          icon: 'tongxun',
          active: false
        },
        {
          name: '站点用户',
          icon: '',
          active: false
        },
        {
          name: '运维记录',
          icon: '',
          active: false
        }
      ]
    },
    {
      name: '报警日志',
      url: '/warn-log',
      // show: false,
      navSelect: [
        {
          name: '全部告警',
          icon: 'quanbu',
          active: false
        },
        {
          name: '关联告警',
          icon: 'icon05',
          active: false
        },
        {
          name: '阈值告警',
          icon: 'dashboard',
          active: false
        }
      ]
    },
    {
      name: '数据审核',
      show: true,
      sub: [
        {
          name: '原始数据',
          url: '/origin-data',
        },
        {
          name: '数据补登',
          url: '/origin-supply',
        },
        {
          name: '数据审核',
          url: '/origin-check',
        }
      ]
    }
  ],
  sideBarList: [
    {
      name: '个人',
      active: false,
      url: '/person',
      navSelect: [
        {
          name: '基本信息',
          active: false
        },
        {
          name: '修改密码',
          active: false
        }
      ]
    },
    {
      name: '用户',
      active: false,
      url: '/user',
      navSelect: [
        {
          name: '用户管理',
          active: false
        },
        {
          name: '角色管理',
          active: false
        }
      ]
    },
    {
      name: '站点',
      active: false,
      url: '/station',
      navSelect: [
        {
          name: '基本资料',
          active: false
        }, 
        {
          name: '因子配置',
          active: false
        }, 
        {
          name: '告警策略',
          active: false
        }
      ]
    },
    {
      name: '告警策略',
      active: false,
      url: '/alarm'
    },
    {
      name: '功能',
      active: false,
      url: '/functions'
    },
    {
      name: '因子库',
      active: false,
      url: '/factor',
      navSelect: [
        {
          name: '因子库',
          active: false
        },
        {
          name: '因子母库',
          active: false
        }
      ]
    },
    {
      name: '其他',
      active: false,
      url: '/others'
    }
  ]
}