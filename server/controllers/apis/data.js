const express = require('express')
const multer =  require('multer')
const FormData = require('form-data')
const fs = require('fs')
const path = require('path')
const request = require('request')

const httpProxy = require('../../helpers/httpProxy')
const server = require('../../configs/server.js')


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './server/uploads/');
  },
  filename: (req, file, cb) => {
    const datetimestamp = Date.now();
    cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
  }
})

const upload = multer({
  storage: storage
}).single('file')



const router = express.Router()

router.get('/city', (req, res) => {
  httpProxy({
    url: '/orgs/city',
    method: 'get',
    qs: { d: req.query.d }
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})


router.get('/latest', (req, res) => {
  httpProxy({
    url: '/stations/latest',
    method: 'get',
    qs: { d: req.query.d, org: req.query.org }
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})

router.get('/latest/:id', (req, res) => {
  httpProxy({
    url: `/stations/${req.params.id}/latest`,
    method: 'get',
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})

router.post('/image', (req, res) => {
  upload(req, res, function(err) {
    if(err) {
      res.json({error_code:1,err_desc:err});
      return;
    }

    httpProxy({
      url: '/upload',
      method: 'post',
      formData: {
        'image': fs.createReadStream(path.resolve(__dirname, '..', '..', '..')+'/server/uploads/'+req.file.filename)
      }
    }, (cb) => {
      res.json(cb);
    }, req.headers.token)

  })

})


router.get('/logs', (req, res) => {
  httpProxy({
    url: '/stations/logs/'+req.query.id+'/connection',
    method: 'get',
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})


// 曲线分析
router.get('/analysis/:id/folding', (req, res) => {
  httpProxy({
    url: `/stations/${req.params.id}/timeshare_chart`,
    method: 'get',
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})

router.get('/analysis/:id/3d/spec', (req, res) => {
  httpProxy({
    url: `/stations/${req.params.id}/3d/spec`,
    method: 'get',
    qs: { startDate: req.query.start, endDate: req.query.end }
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})


router.get('/analysis/:id/2d/spec', (req, res) => {
  httpProxy({
    url: `/stations/${req.params.id}/2d/spec`,
    method: 'get',
    qs: { time: req.query.time }
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})

// 数据报表
router.get('/stations/:id/day', (req, res) => {
  const start = req.query.start;
  const end = req.query.end;

  httpProxy({
    url: `/stations/${req.params.id}/statistics/hour`,
    method: 'get',
    qs: { startDate: start, endDate: end }
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})


router.get('/stations/:id', (req, res) => {
  httpProxy({
    url: `/stations/${req.params.id}/statistics`,
    method: 'get',
    qs: { startDate: req.query.start, endDate: req.query.end }
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})


router.get('/stations/:id/year', (req, res) => {
  httpProxy({
    url: `/stations/${req.params.id}/statistics/month`,
    method: 'get',
    qs: { startDate: req.query.start, endDate: req.query.end }
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})


router.get('/stations/:id/export', (req, res) => {
  const filePath = Date.now();
  request({
    url: `${server.apiUrl.url}:${server.apiUrl.port}/api/stations/${req.params.id}/statistics/download`,
    method: 'get',
    headers: {
      token: req.headers.token
    },
    qs: {
      startDate: req.query.start,
      endDate: req.query.end,
      type: req.query.type,
    },
  }, (err, _res, body) => {
    res.json({ url: '/download/'+filePath+'.xls' });
  }).pipe(fs.createWriteStream(path.resolve(__dirname, '..', '..')+'/download/'+filePath+'.xls'));
})


// 数据管理

router.get('/raw/histories/:id', (req, res) => {
  httpProxy({
    url: `/stations/${req.params.id}/histories/raw`,
    method: 'get',
    qs: {
      startDate: req.query.start,
      endDate: req.query.end
    }
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})

router.get('/histories/:id', (req, res) => {
  httpProxy({
    url: `/stations/${req.params.id}/histories`,
    method: 'get',
    qs: {
      startDate: req.query.start,
      endDate: req.query.end
    }
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})

router.get('/lost/histories/:id', (req, res) => {
  httpProxy({
    url: `/stations/${req.params.id}/histories/lost`,
    method: 'get',
    qs: { startDate: req.query.start, endDate: req.query.end, count: req.query.count }
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})


router.get('/stations/:id/histories', (req, res) => {
  httpProxy({
    url: `/stations/${req.params.id}/histories/audit`,
    method: 'get',
    qs: { startDate: req.query.start, endDate: req.query.end }
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})


router.get('/stations/:id/hour', (req, res) => {
  httpProxy({
    url: `/stations/${req.params.id}/statistics/hour`,
    method: 'get',
    qs: { startDate: req.query.start, endDate: req.query.end }
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})


router.post('/histories', (req, res) => {
  httpProxy({
    url: `/histories`,
    method: 'post',
    body: JSON.stringify({
      station_id: req.body.station_id,
      datatime: req.body.datatime,
      data_json: JSON.stringify(req.body.data_json),
      comment: req.body.comment
    })
  }, (cb) => {
    res.json(cb);
  }, req.headers.token, true);
})


router.delete('/histories/:id', (req, res) => {
  httpProxy({
    url: `/histories/${req.params.id}`,
    method: 'delete'
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})


router.put('/histories', (req, res) => {
  httpProxy({
    url: `/histories`,
    method: 'put',
    body: JSON.stringify({
      id: req.body.id,
      data_json: req.body.data_json,
      comment: req.body.comment
    })
  }, (cb) => {
    res.json(cb);
  }, req.headers.token, true)
})

// 告警策略
router.get('/alarms/:station_id', (req, res) => {
  httpProxy({
    url: `/stations/${req.params.station_id}/alarms`,
    method: 'get',
    qs: {
      startDate: req.query.start,
      endDate: req.query.end,
      type: req.query.type
    }
  }, (cb) => {
    res.json(cb);
  }, req.headers.token, true)
})

router.get('/stations/alarms/find', (req, res) => {
  httpProxy({
    url: '/stations/alarms',
    method: 'get',
    qs: {
      startDate: req.query.start,
      endDate: req.query.end
    }
  }, (cb) => {
    res.json(cb);
  }, req.headers.token)
})


router.get('/stations/:id/map', (req, res) => {
  httpProxy({
    url: `/stations/${req.params.id}/map`,
    method: 'get'
  }, (cb) => {
    res.json(cb);
  }, req.headers.token, true)
})


router.get('/history/update/log', (req, res) => {
  httpProxy({
    url: `/history/update/log`,
    method: 'get',
    qs: {
      station_id: req.query.station_id,
      startDate: req.query.start,
      endDate: req.query.end,
    }
  }, (cb) => {
    res.json(cb);
  }, req.headers.token, true)
})

router.put('/histories/:id', (req, res) => {
  httpProxy({
    url: `/histories/${req.params.id}`,
    method: 'put',
    body: JSON.stringify({
      comment: req.body.comment
    })
  }, (cb) => {
    res.json(cb);
  }, req.headers.token, true)
})


router.get('/history/reverse/log', (req, res) => {
  httpProxy({
    url: `/history/reverse/log`,
    method: 'get',
    qs: {
      station_id: req.query.station_id,
      startDate: req.query.start,
      endDate: req.query.end,
    }
  }, (cb) => {
    res.json(cb);
  }, req.headers.token, true)
})


router.get('/history/append/log', (req, res) => {
  httpProxy({
    url: `/history/append/log`,
    method: 'get',
    qs: {
      station_id: req.query.id,
      startDate: req.query.start,
      endDate: req.query.end,
    }
  }, (cb) => {
    res.json(cb);
  }, req.headers.token, true)
})

module.exports = router