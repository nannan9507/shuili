'use strict';
const express = require('express')
const httpProxy = require('../../helpers/httpProxy')


const router = express.Router()

router.get('/', (req, res) => {
  httpProxy({
    url: '/alarm_policy',
    method: 'get'
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})


router.put('/update', (req, res) => {
  const id = parseInt(req.body.id);
  const name = req.body.name;
  const type = parseInt(req.body.type);
  let conditions = JSON.parse(req.body.conditions);

  httpProxy({
    url: '/alarm_policy',
    method: 'put',
    body: JSON.stringify({
      id: id,
      name: name,
      type: type,
      conditions: conditions,
    })
  }, (cb) => {
    res.json(cb);
  }, req.headers.token, true)
})


router.get('/:id', (req, res) => {
  httpProxy({
    url: '/alarm_policy/'+req.params.id,
    method: 'get'
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})

router.post('/new', (req, res) => {
  let conditions = JSON.parse(req.body.conditions);
  const name = req.body.name;
  const type = parseInt(req.body.type);

  httpProxy({
    url: '/alarm_policy',
    method: 'post',
    body: JSON.stringify({
      conditions: conditions,
      name: name,
      type: type,
    })
  }, (cb) => {
    res.json(cb);
  }, req.headers.token, true)
})


router.delete('/:id', (req, res) => {
  httpProxy({
    url: '/alarm_policy/'+req.params.id,
    method: 'delete'
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})
module.exports = router