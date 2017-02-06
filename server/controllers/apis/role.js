const express = require('express')

const httpProxy = require('../../helpers/httpProxy')


const router = express.Router()

router.get('/', (req, res) => {
  httpProxy({
    url: '/roles',
    method: 'get'
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})

router.post('/new', (req, res) => {
  httpProxy({
    url: '/roles',
    method: 'post',
    body: JSON.stringify({
      name: req.body.name,
      description: req.body.description
    })
  }, (cb) => {
    res.json(cb);
  }, req.headers.token, true)
})

router.get('/:id', (req, res) => {
  httpProxy({
    url: '/roles/'+req.params.id,
    method: 'get'
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})

router.delete('/:id', (req, res) => {
  httpProxy({
    url: '/roles/'+req.params.id,
    method: 'delete'
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})

router.put('/update', (req, res) => {
  const id = parseInt(req.body.id);
  const name = req.body.name;
  const description = req.body.description;
 
  httpProxy({
    url: '/roles',
    method: 'put',
    body: JSON.stringify({
      id: id,
      name: name,
      description: description
    })
  }, (cb) => {
    res.json(cb);
  }, req.headers.token, true)
})


router.get('/menu/:id', (req, res) => {
  httpProxy({
    url: '/roles/'+req.params.id+'/menu',
    method: 'get'
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})


router.put('/menu/:id', (req, res) => {
  httpProxy({
    url: '/roles/'+req.params.id+'/menu',
    method: 'put',
    body: JSON.stringify({
      menu_auth: req.body.roles
    })
  }, (cb) => {
    res.json(cb);
  }, req.headers.token, true)
})


router.get('/station/:id', (req, res) => {
  httpProxy({
    url: '/roles/'+req.params.id+'/station',
    method: 'get'
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})

router.put('/station/:id', (req, res) => {
  httpProxy({
    url: '/roles/'+req.params.id+'/station',
    method: 'put',
    body: JSON.stringify({
      station_auth: req.body.stations
    })
  }, (cb) => {
    res.json(cb);
  }, req.headers.token, true)
})

module.exports = router