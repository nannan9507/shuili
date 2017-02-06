export default {
  token: {
    url: '/apis/user/login',
    method: 'POST'
  },
  getUser: {
    url: '/apis/user{/id}',
    method: 'GET'
  },
  resetPass: {
    url: '/apis/user/pass/resetPass',
    method: 'PUT'
  },
  saveUser: {
    url: '/apis/user/',
    method: 'POST'
  },
  deleleUsers: {
    url: '/apis/user/',
    method: 'DELETE'
  },
  updateUser: {
    url: '/apis/user/',
    method: 'PUT'
  },
  updatePassword: {
    url: '/apis/user/password',
    method: 'PUT'
  },
  getStations: {
    url: '/apis/station/',
    method: 'GET'
  },
  addStation: {
    url: '/apis/station/add',
    method: 'POST'
  },
  updateStation: {
    url: '/apis/station/update',
    method: 'PUT'
  },
  updateStationFactor: {
    url: '/apis/station/update_factor',
    method: 'PUT'
  },
  updateStationAlarm: {
    url: '/apis/station/alarm/update',
    method: 'PUT'
  },
  root_org: {
    url: '/apis/station{/:root_org}',
    method: 'GET'
  },
  getFactor: {
    url: '/apis/factor/',
    method: 'GET'
  },
  getChoiceFactor: {
    url: '/apis/factor/choice',
    method: 'GET'
  },
  addFactor: {
    url: '/apis/factor/addFactor',
    method: 'POST'
  },
  getDeps: {
    url: '/apis/depart/',
    method: 'GET'
  },
  getDepsUser: {
    url: '/apis/depart{/id}',
    method: 'GET'
  },
  updateDeptName: {
    url: '/apis/depart/update',
    method: 'PUT'
  },
  addDept: {
    url: '/apis/depart/new',
    method: 'POST'
  },
  delDept: {
    url: '/apis/depart{/id}',
    method: 'DELETE'
  },

  getAlarms: {
    url: '/apis/alarm',
    method: 'GET'
  },
  addAlarm: {
    url: '/apis/alarm/new',
    method: 'POST'
  },
  updateAlarm: {
    url: '/apis/alarm/update',
    method: 'PUT'
  },

  getRoles: {
    url: '/apis/role',
    method: 'GET'
  },
  addRole: {
    url: '/apis/role/new',
    method: 'POST'
  },
  editRole: {
    url: '/apis/role/update',
    method: 'PUT'
  },

  getLatest: {
    url: '/apis/data/latest',
    method: 'GET'
  },

  getCity: {
    url: '/apis/data/city',
    method: 'GET'
  },

  getOrgTree: {
    url: '/apis/station/stations/tree',
    method: 'GET'
  }
}