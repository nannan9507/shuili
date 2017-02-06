const user = require('./apis/user')
const station = require('./apis/station')
const factor = require('./apis/factor')
const depart = require('./apis/depart')
const alarm = require('./apis/alarm')
const role = require('./apis/role')
const data = require('./apis/data')

module.exports = (app) => {
  
  app.get('/', (req, res) => {
    // if (req.headers['user-agent'].indexOf('MSIE') > -1 || req.headers['user-agent'].indexOf('rv:11') > -1) {
    //   res.render('check');
    // } else {
    res.render('index', { env: process.env.NODE_ENV });
    // }
  });

  app.use('/apis/user', user);
  app.use('/apis/station', station);
  app.use('/apis/factor', factor);
  app.use('/apis/depart', depart);
  app.use('/apis/alarm', alarm);
  app.use('/apis/role', role);
  app.use('/apis/data', data);
}