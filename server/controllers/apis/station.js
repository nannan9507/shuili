const express = require('express')

const httpProxy = require('../../helpers/httpProxy')


const router = express.Router()

router.get('/', (req, res) => {
  httpProxy({
    method: 'get',
    url: '/stations'
  }, (cb) => {
    res.json(cb);
  }, req.headers.token);
})

router.put('/update', (req, res) => {
  httpProxy({
    method: 'put',
    url: '/stations',
    body: JSON.stringify({
      name: req.body.name,
      id: req.body.id,
      org_id: req.body.org_id,
      password: req.body.password,
      coordinate: req.body.coordinate,
      description: req.body.description,
      image: req.body.image,
      teamviewer: req.body.teamviewer
    })
  }, (cb) => {
    res.json(cb);
  }, req.headers.token, true);
})

router.get('/:id', (req, res) => {
  httpProxy({
    method: 'get',
    url: '/stations/'+req.params.id
  }, (cb) => {
    res.json(cb);
  }, req.headers.token);
})

router.delete('/:id', (req, res) => {
  httpProxy({
    method: 'delete',
    url: '/stations/'+req.params.id
  }, (cb) => {
    res.json(cb);
  }, req.headers.token);
})

router.get('/factor/:id', (req, res) => {
  httpProxy({
    method: 'get',
    url: '/stations/'+req.params.id+'/factor'
  }, (cb) => {
    res.json(cb);
  }, req.headers.token);
})

router.post('/add', (req, res) => {
  httpProxy({
    method: 'post',
    url: '/stations',
    body: JSON.stringify({
      name: req.body.name,
      org_id: parseInt(req.body.org_id),
      station_code: req.body.station_code,
      password: req.body.password,
      coordinate: req.body.coordinate,
      description: req.body.description,
      image: req.body.image,
      teamviewer: req.body.teamviewer
    })
  }, (cb) => {
    res.json(cb);
  }, req.headers.token, true);
})

// router.get('/:id', (req, res) => {
//   httpProxy({
//     method: 'get',
//     url: '/stations/'+req.params.id+'/factor'
//   }, (cb) => {
//     res.json(cb);
//   }, req.headers.token)
// })

router.put('/update_factor', (req, res) => {
  httpProxy({
    method: 'put',
    url: '/stations/factor',
    body: JSON.stringify({
      id: parseInt(req.body.id),
      factors: req.body.factors
    })
  }, (cb) => {
    res.json(cb);
  }, req.headers.token, true)
})

router.get('/tree/orgs', (req, res) => {
  httpProxy({
    method: 'get',
    url: '/orgs'
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})


router.get('/stations/tree', (req, res) => {
  httpProxy({
    method: 'get',
    url: '/stations/tree',
    qs: {
      type: req.query.type
    }
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})

router.get('/alarm/:id', (req, res) => {
  httpProxy({
    method: 'get',
    url: '/stations/'+req.params.id+'/alarm_policy'
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})

router.put('/alarm/update', (req, res) => {
  httpProxy({
    method: 'put',
    url: '/stations/alarm_policy',
    body: JSON.stringify({
      id: parseInt(req.body.id),
      alarm_policies: req.body.alarm_policies
    })
  }, (cb) => {
    res.json(cb);
  }, req.headers.token, true)
})


router.get('/stations/:id', (req, res) => {
  httpProxy({
    method: 'get',
    url: '/stations/'+req.params.id
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})

router.get('/home/setting', (req, res) => {
  httpProxy({
    method: 'get',
    url: '/setting'
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})

router.put('/home/setting', (req, res) => {
  httpProxy({
    method: 'put',
    url: '/setting',
    body: JSON.stringify({
      sys_name: req.body.sys_name,
      company_name: req.body.company_name
    })
  }, (cb) => {
    res.json(cb);
  }, req.headers.token, true)
})

module.exports = router