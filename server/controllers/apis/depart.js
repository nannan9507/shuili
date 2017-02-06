const express = require('express')

const httpProxy = require('../../helpers/httpProxy')


const router = express.Router()

router.get('/', (req, res) => {
  httpProxy({
    url: '/depts',
    method: 'get'
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})

router.get('/:id', (req, res) => {
  httpProxy({
    url: '/depts/'+req.params.id+'/users',
    method: 'get'
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})

router.post('/new', (req, res) => {
  const id = req.body.id;
  const name = req.body.name;

  httpProxy({
    url: '/depts',
    method: 'post',
    body: JSON.stringify({ pId: id, name: name })
  }, (cb) => {
    res.json(cb);
  }, req.headers.token, true)
})

router.put('/update', (req, res) => {
  const id = req.body.id;
  const name = req.body.name;

  httpProxy({
    url: '/depts',
    method: 'put',
    body: JSON.stringify({id: id, name: name})
  }, (cb) => {
    res.json(cb);
  }, req.headers.token, true)
})

router.delete('/:id', (req, res) => {
  httpProxy({
    url: '/depts/'+req.params.id,
    method: 'delete'
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})
module.exports = router