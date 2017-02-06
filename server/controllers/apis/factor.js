const express = require('express')

const httpProxy = require('../../helpers/httpProxy')


const router = express.Router()

router.get('/', (req, res) => {
  const q = decodeURI(req.query.q);

  httpProxy({
    method: 'get',
    url: '/factors_pool',
    qs: {
      q: q
    }
  }, (cb) => {
    res.json(cb);
  }, req.headers.token);
})


router.get('/choice', (req, res) => {
  httpProxy({
    method: 'get',
    url: '/factors'
  }, (cb) => {
    res.json(cb);
  }, req.headers.token);
})


router.post('/addFactor', (req, res) => {
  const factors = req.body.list;

  httpProxy({
    method: 'post',
    url: '/factors',
    body: JSON.stringify(factors)
  }, (cb) => {
    res.json(cb);
  }, req.headers.token, true)
})


module.exports = router