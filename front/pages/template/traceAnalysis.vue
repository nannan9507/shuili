<style>
  .active {
    color: #2277da;
  }
</style>

<template>
<div class="trace-analysis">
  <div class="line" style="overflow: hidden;">
    <div style="float: left;">
      <label>
        <input type="radio" name="type" @click="changeType('polyline')" checked />
        <span>分时图</span>
      </label>
      <label>
        <input type="radio" name="type" @click="changeType('rect')" />
        <span>柱形图</span>
      </label>
      <label>
        <input type="radio" name="type" @click="changeType()" />
        <span>K线图</span>
      </label>
      <label>
        <input type="radio" name="type" @click="changeType()" />
        <span>发光菌毒性分析</span>
      </label>
      <label>
        <input type="radio" name="type" @click="changeType('plotly')" />
        <span>UV-VIS光谱分析</span>
      </label>
      
    </div>
    <div style="float: left;">
      <button class="button-normal" v-show="type === 'polyline' && showZtree === true" @click="openStationTree">{{ treeStatus ? '隐藏' : '选择' }}站点对比</button>

      <ztree name="trace" type="checkbox" v-show="type === 'polyline' && treeStatus"></ztree>
    </div>
  </div>
  
  <div class="overflow: hidden;">
    <input class="time-input" style="float: left;" id="hour" type="text" v-show="type === 'plotly' && plotlyType === 0" readonly />

    <div class="timePicker" style="float: left;" v-show="type === 'plotly' && plotlyType === 1" readonly>
      <div class="input-daterange" data-provide="datepicker">
      <input style="border: 1px solid #ccc; text-align: left;" type="text" class="time-input time1" id="time1" /> 
      <span style="color: #666;">-</span>
      <input style="border: 1px solid #ccc; text-align: left;" type="text" class="time-input time2" id="time2" /> 
      </div>
    </div> 
    <!-- <input class="time-input" style="float: left;" id="day" type="text" v-show="type === 'plotly' && plotlyType === 1" readonly /> -->
    <div :class="{ 'active': plotlyType === 0 }" style="float: left; margin-top: 30px; margin-left: 20px; cursor: pointer;" v-show="type === 'plotly'" @click="togglePlotlyType(0)">2D</div> 
    <div :class="{ 'active': plotlyType === 1 }" style="float: left; margin-top: 30px; margin-left: 20px; cursor: pointer;" v-show="type === 'plotly'" @click="togglePlotlyType(1)">3D</div>
  </div>

  <div class="line" v-if="type === 'polyline'">
    <div class="map-box" v-for="i in factorsList.length">
      <div class="map">
        <div id="container-{{i}}"></div>
      </div>
      <div class="show">
        <h3>最新数据</h3>
        <p class="data">{{ Math.abs(factorsList[i].now_value) >= 0 ? factorsList[i].now_value : '-' }}
          <span>{{ factorsList[i].m_unit }}</span>
        </p>
        <p>更新时间: {{ factorsList[i].timeStr }}</p>
      </div>
    </div>
  </div>

  <div class="rect" v-if="type === 'rect'">
    <div class="map-box" v-for="i in factorsList.length">
      <div class="map">
        <div id="container-{{i}}"></div>
      </div>
    </div>
  </div>

  <div id="plot1" v-if="type === 'plotly' && plotlyType === 0" style="margin-top: 100px;"></div>
  <div id="plot2" v-if="type === 'plotly' && plotlyType === 1" style="float: left; margin-top: 20px;"></div>
</div>

</template>

<script>
var formatDateTime = function (date) {
  var y = date.getFullYear();  
  var m = date.getMonth() + 1;  
  m = m < 10 ? ('0' + m) : m;  
  var d = date.getDate();  
  d = d < 10 ? ('0' + d) : d;  
  var h = date.getHours();
  h = h < 10 ? ('0' + h) : h;
  var minute = date.getMinutes();  
  minute = minute < 10 ? ('0' + minute) : minute;  
  return y + '-' + m + '-' + d+' '+h+':'+minute;  
};  

import Highstocks from 'highcharts/highstock'
import moment from 'moment'
import $ from 'jquery'
import ztree from '../../components/Ztree.vue'
import { requestHandler } from '../../services/index.js'
import feature from 'feature.js'

import '../../styles/jquery.datetimepicker.css'
import '../../styles/bootstrap-datepicker.standalone.css'
import '../../services/bootstrap-datepicker.min.js'
import '../../services/bootstrap-datepicker.zh-CN.min.js'

import '../../services/bootstrap-datetimepicker.js'
import '../../styles/datetimepicker.css'
import '../../services/bootstrap-datetimepicker.zh-CN.js'


const isIE = navigator.userAgent.indexOf('MSIE') > -1 && navigator.userAgent.indexOf('rv') > -1;
const isIE11 = (navigator.userAgent.toLowerCase().indexOf("trident") > -1 && navigator.userAgent.indexOf("rv") > -1);
const isFF = navigator.userAgent.indexOf('Firefox') > -1;

let Plotly = null;
if (isFF || isIE11 || isIE) {

} else {
  Plotly = require('plotly.js');
}

export default {
  components: {
    ztree
  },
  data() {
    return {
      time: {
        start: '',
        end: ''
      },
      station: {},
      factorsList: [],
      chart: {},
      type: 'polyline',
      treeStatus: false,
      series: [],
      saveStation: '',
      staionsNumberLimit: 3,
      plotlyType: 0,
      timeDetail: '',
      colorList: [],
      showZtree: false
    }
  },
  watch: {
    'station'(n, o) {
      switch (this.type) {
        case 'polyline':
          this.getStationByLine(n);
          break;
        case 'rect':
          this.getStationByRect(n);
          break;
        case 'plotly':
          if (this.plotlyType === 0) {
            this.getStationByPlotly('2d', n);
          } else {
            this.getStationByPlotly('3d', n);
          }
          break;
      }
    }
  },
  ready() {
    this.colorList = ['#4C556E', '#FFD700', '#FF3E96', '#BFEFFF'];

    $(document).ready(() => {    
      $('#hour').datetimepicker({
        format: 'yyyy-mm-dd hh:ii',
        weekStart: 1,
        language: "zh-CN",
        autoclose: true,
        todayHighlight: true,
        startView: 0,
        maxView: 4
      }).on('changeDate', (e) => {
        this.timeDetail = moment(e.date).startOf('minute').format('YYYYMMDDHHmmSS');
        this.getStationByPlotly('2d');
      })
    })

    this.getStationByLine()
  },
  methods: {
    blockup(flag) {
      if (flag) {
        this.$dispatch('openMask', true);
        window.plotly_timer = setTimeout(() => {
          this.$dispatch('Warning:dispatch', '加载超时, 请稍后重试', 'fail');
          this.$dispatch('closeMask');
        }, 1000 * 10);
      } else {
        clearTimeout(window.plotly_timer);
        this.$dispatch('closeMask');
      }
    },
    togglePlotlyType(type) {
      this.plotlyType = type;
      if (type === 0) {
        this.getStationByPlotly('2d');
      } else if (type === 1) {
        this.blockup(1);
        $('#time1').val(moment().subtract(7, "days").startOf('day').format('YYYY/MM/DD'))
        $('#time2').val(moment().endOf('day').format('YYYY/MM/DD'))
        this.time = {
          start: moment().subtract(7, "days").startOf('day').format('YYYY/MM/DD'),
          end: moment().endOf('day').format('YYYY/MM/DD')
        }

        this.getStationByPlotly('3d');

        const that = this;

        $('.input-daterange input').each(function () {
          $(this).datepicker({
            format: 'yyyy/mm/dd',
            weekStart: 1,
            language: "zh-CN",
            autoclose: true,
            todayHighlight: true,
            startView: 'day',
            maxViewMode: 'decade',
          }).on('changeDate', (e) => {
            if ($(e.target)[0].className === 'time-input time1') {
              that.time.start = moment(e.date).startOf('day').format('YYYY/MM/DD');
            } else if ($(e.target)[0].className === 'time-input time2') {
              that.time.end = moment(e.date).endOf('day').format('YYYY/MM/DD');
            }

            if (that.time.start && that.time.end) {
              that.getStationByPlotly('3d');
            }
            
          })
          
        })
      }
    },
    changeType(type) {
      this.factorsList = [];
      this.type = type;

      switch (this.type) {
        case 'polyline':
          this.getStationByLine();
          break;
        case 'rect':
          this.getStationByRect();
          break;
        case 'plotly':
          $('#day').val(moment().startOf('day').format('YYYY-MM-DD'));
          this.time.start = moment().startOf('day').format('YYYY/MM/DD');
          this.time.end = moment().endOf('day').format('YYYY/MM/DD');
          
          $('#hour').datetimepicker({
            format: 'yyyy-mm-dd hh:ii',
            weekStart: 1,
            language: "zh-CN",
            autoclose: true,
            todayHighlight: true,
            startView: 0,
            maxView: 4
          }).on('changeDate', (e) => {
            this.timeDetail = moment(e.date).startOf('minute').format('YYYYMMDDHHmmSS');
            this.getStationByPlotly('2d');
          })

          this.plotlyType = 0;
          this.getStationByPlotly('2d');

          
          break;
      }
    },
    openStationTree() {
      this.treeStatus = !this.treeStatus;
    },
    getStationByLine(station=JSON.parse(sessionStorage.getItem('station'))) {
      if (station && station.id) {
        this.saveStation = station.id;
        const factorsReq = this.$resource('/apis/station/factor{/id}');
        factorsReq.get({
          id: station.id
        }).then((res) => {
          if (res.body.data) {
            this.blockup(1);
            this.factorsList = [];
            for (let factor of res.body.data) {
              if (factor.selected) {
                this.factorsList.push({ db_field: factor.db_field, m_unit: factor.m_unit, name: factor.name, now_value: '', timeStr: '' });
              }
            }

            let factorsObj = {};
            for (let i of this.factorsList) {
              factorsObj[i.db_field] = { db_field: i.db_field, m_unit: i.m_unit, name: i.name, list: [] }
            }
            
            this.factorsObj = factorsObj;

            // this.factorsList 为所有factors

            const resource = this.$resource('/apis/data/analysis{/id}/folding');
            resource.get({
              id: station.id
            }).then((_res) => {
              // 获取最新数据
              const new_data = _res.body.data.lineChartWrappers[_res.body.data.lineChartWrappers.length-1];

              $.each(this.factorsList, (_, key) => {
                _res.body.data.lineChartWrappers.map((row) => {
                  key.now_value = row.map[key.db_field].value;
                  key.timeStr = formatDateTime(new Date(row.timemils));
                })
              })

              this.drawLine(_res);
              this.blockup(0);
            })
          } else {
            this.blockup(0);
          }
        })
      }
    },
    drawLine(_res) {
      let factorsObj = this.factorsObj;

      let index = 0;

      new Promise((resolve, reject) => {
        resolve();
      }).then(() => {

      $.each(this.factorsList, (_, key) => {

        let data = _res.body.data.lineChartWrappers.map((row) => {
          return [row.timemils, row.map[key.db_field].double_value];
        })

        let flag = { status: false, index: null, size: -1 };
        for (let i = 0; i < factorsObj[key.db_field].list.length; i++) {
          flag.size = factorsObj[key.db_field].list.length-1;
          if (_res.body.data.station_name === i.station_name) {
            flag = { status: true, index: i }
          } 
        }

        if (flag.status) {
          factorsObj[key.db_field].list.splice(flag.index, 1);
        } else {
          factorsObj[key.db_field].list.push({ name: _res.body.data.station_name, data: data, tooltip: { valueDecimals: 2 }, color: this.colorList[flag.size] });
        }


        factorsObj[key.db_field].setting = {
          exporting: {
              enabled: false
          },
          rangeSelector: {
              buttons: [{
                  type: 'day',
                  count: 1,
                  text: '1天'
              }, {
                  type: 'week',
                  count: 1,
                  text: '1周'
              }, {
                  type: 'month',
                  count: 1,
                  text: '1月'
              }, {
                  type: 'month',
                  count: 3,
                  text: '3月'
              }, {
                  type: 'month',
                  count: 6,
                  text: '半年'
              },  {
                  type: 'year',
                  count: 1,
                  text: '1年'
              }, {
                  type: 'all',
                  text: '全部'
              }],
              selected: 1,
              inputEnabled:false
          },
          title : {
            text : `<span style="color: #007ad5;"><b>${this.factorsObj[key.db_field].name}</b><span style="${this.factorsObj[key.db_field].m_unit ? '': 'display: none;'}">(</span><b>${this.factorsObj[key.db_field].m_unit}</b><span style="${this.factorsObj[key.db_field].m_unit ? '': 'display: none;'}">)</span></span>`,
            align: 'left',
            useHTML: true
          },
          xAxis: {
              labels: {
                  formatter: function () {
                      var vDate=new Date(this.value);
                      var dayWrapper = moment(vDate);
                      return dayWrapper.format("MM月DD日");
                  }
              }
          },
          tooltip: {
              formatter: function() {
                  var s = Highstocks.dateFormat('%Y年%m月%d日 %H:%M:%S', this.x);
                  $.each(this.points, function(i, point) {
                      s += '<br/><b>' + '<span style="color: '+point.color+';">'+this.series.name+'</span>' + '： '+ point.y + ' ' + factorsObj[key.db_field].m_unit + ' </b>';
                  });
                  return s;
              }
          },
          series: this.factorsObj[key.db_field].list
        };

        this.$nextTick(() => {

          $('#container-' + index).highcharts('StockChart', factorsObj[key.db_field].setting);

          index++;
        })
      })
          
      }).then(() => {
        this.showZtree = true;
      })
    },
    getStationByRect(station=JSON.parse(sessionStorage.getItem('station'))) {
      const resource = this.$resource('/apis/data/stations{/id}/year');
      if (station && station.id) {
        resource.get({
          id: station.id,
          start: moment().startOf('year').format('YYYY/MM/DD'),
          end: moment().endOf('year').format('YYYY/MM/DD')
        }).then((res) => {
          if (res.body.data) {
            let factors = [];

            let months = [];
            let factors_value = [];

            for (let i in res.body.data) {
              months.push((moment(new Date(i)).month()+1)+'月');
            }

            for (let i in res.body.data) {
              for (let j in res.body.data[i]) {
                factors.push({ db_field: j, name: res.body.data[i][j].name, m_unit: res.body.data[i][j].m_unit, list: [] });
              }
            }

            // \\\\b9u2g
            for (let factor of factors) {
              for (let i in res.body.data) {
                if (res.body.data[i][factor.db_field].double_value) {
                  factor.list.push(res.body.data[i][factor.db_field].double_value);
                } else {
                  factor.list.push(0)
                }
              }
            }

            this.factorsList = factors;

            factors.forEach((result, index) => {
              let show;
              if (result.m_unit) {
                show = '';
              } else {
                show = 'hidden';
              }

              this.$nextTick(() => {
                $('#container-'+index).highcharts({
                  credits: {
                    enabled: false   //右下角不显示LOGO 
                  },
                  chart: {
                    type: 'column'
                  },
                  title : {
                    text : `<span style="color: #007ad5;font-size: 15px;"><b>${result.name}<span style="display: ${show}">(${result.m_unit})</span></b></span>`,
                    align: 'left',
                    useHTML: true
                  },
                  xAxis: {
                    categories: months,
                    corsshair: true
                  },
                  // tooltip: {
                  //   formatter: function() {
                  //     var s = Highstocks.dateFormat('%Y年%m月', this.x);
                  //     $.each(this.points, function(i, point) {

                  //       s+= `<br/><b>${result.name}: ${point.y}(${result.db_unit})</b>`
                  //     });
                  //     return s;
                  //   }
                  // },
                  plotOptions: {
                    column: {
                      pointPadding: 0.2,
                      borderWidth: 1
                    }
                  },
                  yAxis: {
                    title: {text: `${result.name}(${result.m_unit})`}, //标题 
                    lineWidth: 2 //基线宽度 
                  },
                  series: [{
                    name: result.name,
                    data: result.list
                  }]
                })
              })
            })
          }
        })
      }
    },
    getStationByPlotly(type, station=JSON.parse(sessionStorage.getItem('station'))) {
      $('#plot1').empty();
      $('#plot2').empty();
      let resource;

      if (type === '3d') {
        /*if (!Plotly) {
          this.blockup(0);
          return this.$dispatch('Warning:dispatch', '火狐、IE11及以下浏览器不支持三维视图', 'fail');
        }*/

        if (window.feature.webGL) {
          if (station && station.id) {
            resource = this.$resource('/apis/data/analysis{/id}/3d/spec');

            resource.get({
              id: station.id,
              start: this.time.start,
              end: this.time.end
            }).then((res) => {
              if (res.body.data && res.body.data.length > 0) {
                var el = document.getElementById('plot2');
                var hoverinfo = document.getElementById('hoverinfo');

                const xLines = res.body.data;

                var z_data = xLines.map(function(xLine){
                    return xLine.data;
                });
                var y_data = xLines.map(function(xLine){
                    return xLine.datatime;
                });

                var x_ratio = 2;
                var z_ratio = 1;
                var y_ratio = (xLines.length / 96 * 2);
                var max_ratio = Math.max(x_ratio, y_ratio, z_ratio);
                x_ratio = x_ratio / max_ratio;
                y_ratio = y_ratio / max_ratio;
                z_ratio = z_ratio / max_ratio;

                var plot = Plotly.newPlot(
                    'plot2',
                    [{
                        type: 'surface',
                        // x: x_data,
                        z: z_data,
                        y: y_data,
                        colorscale: 'Portland',
                        colorbar: {
                            ypad: 50
                        },
                    }],
                    {
                      hovermode: 'closest',
                        scene: {
                            camera: {
                                eye: {
                                    y: -0.8381434423857645,
                                    x: 0.2468921533799957,
                                    z: 0.2016008411563396
                                },
                                up: {
                                    y: 0,
                                    x: 0,
                                    z: 1
                                },
                                center: {
                                    y: -0.12926392086922825,
                                    x: -0.14930829677639507,
                                    z: -0.1526099175692974
                                }
                            },
                            aspectmode: 'manual',
                            aspectratio: {
                                x: x_ratio,
                                y: y_ratio,
                                z: z_ratio
                            },
                            xaxis: {
                                title: '波长[nm]',
                                showgrid: false,
                                // showline: true,
                                tick0: 200,
                                dtick: 50,
                                ticklen: 5
                            },
                            zaxis: {
                                title: '吸光度[Abs/m]',
                                // showline: true,
                                dtick: 5,
                                tick0: 0,
                                ticklen: 5,
                                showbackground: true,
                                backgroundcolor: 'lightgray'
                            },
                            yaxis: {
                                type: 'date',
                                title: '时间',
                                // showline: true,
                                tickformat: '%y/%m/%d %X',
                                ticklen: 5,
                                showgrid: false,
                            },
                        },
                        width: 1200,
                        height: 640,
                        margin: {
                            l: 0,
                            r: 0,
                            t: 10,
                            b: 0
                        }
                    }
                ).then(() => {
                  this.blockup(0)
                });

              } else {
                this.blockup(0);
                this.$dispatch('Warning:dispatch', '该时间内无光谱数据', 'fail');
              }
            })
          }
        } else {
          this.blockup(0);
          this.$dispatch('Warning:dispatch', '您的浏览器不支持WGL特性来渲染三维光谱图', 'fail');
        }

      } else if (type === '2d') {

        if (station && station.id) {
          resource = this.$resource('/apis/data/analysis{/id}/2d/spec');

          resource.get({
            id: station.id,
            time: this.timeDetail
          }).then((res) => {
            if (res.body.message) {
              return this.$dispatch('Warning:dispatch', res.body.msessage, 'fail');
            }

            if (res.body.data) {
              $('#hour').val(moment(res.body.data.datatime).startOf('minute').format('YYYY-MM-DD HH:mm'))
              this.timeDetail = moment(res.body.data.datatime).startOf('minute').format('YYYYMMDDHHmmSS');

              let timeline = [200, 202.5, 205, 207.5, 210, 212.5, 215, 217.5, 220, 222.5, 225, 227.5, 230, 232.5, 235, 237.5, 240, 242.5, 245, 247.5, 250, 252.5, 255, 257.5, 260, 262.5, 265, 267.5, 270, 272.5, 275, 277.5, 280, 282.5, 285, 287.5, 290, 292.5, 295, 297.5, 300, 302.5, 305, 307.5, 310, 312.5, 315, 317.5, 320, 322.5, 325, 327.5, 330, 332.5, 335, 337.5, 340, 342.5, 345, 347.5, 350, 352.5, 355, 357.5, 360, 362.5, 365, 367.5, 370, 372.5, 375, 377.5, 380, 382.5, 385, 387.5, 390, 392.5, 395, 397.5, 400, 402.5, 405, 407.5, 410, 412.5, 415, 417.5, 420, 422.5, 425, 427.5, 430, 432.5, 435, 437.5, 440, 442.5, 445, 447.5, 450, 452.5, 455, 457.5, 460, 462.5, 465, 467.5, 470, 472.5, 475, 477.5, 480, 482.5, 485, 487.5, 490, 492.5, 495, 497.5, 500, 502.5, 505, 507.5, 510, 512.5, 515, 517.5, 520, 522.5, 525, 527.5, 530, 532.5, 535, 537.5, 540, 542.5, 545, 547.5, 550, 552.5, 555, 557.5, 560, 562.5, 565, 567.5, 570, 572.5, 575, 577.5, 580, 582.5, 585, 587.5, 590, 592.5, 595, 597.5, 600, 602.5, 605, 607.5, 610, 612.5, 615, 617.5, 620, 622.5, 625, 627.5, 630, 632.5, 635, 637.5, 640, 642.5, 645, 647.5, 650, 652.5, 655, 657.5, 660, 662.5, 665, 667.5, 670, 672.5, 675, 677.5, 680, 682.5, 685, 687.5, 690, 692.5, 695, 697.5, 700, 702.5, 705, 707.5, 710, 712.5, 715, 717.5, 720, 722.5, 725, 727.5, 730, 732.5, 735, 737.5, 740, 742.5, 745, 747.5, 750];

              let _list = [];

              if (res.body.data.data.length > 0) {
                for (let i = 0; i < timeline.length; i++) {
                  _list.push([timeline[i], res.body.data.data[i]]);
                }
              }

              this.$nextTick(() => {
                $('#plot1').highcharts({
                  title: {
                    text: ''
                  },
                  xAxis: {
                    categories: timeline
                  },
                  yAxis: {
                    title: {text: `吸光度[Abs/m]`}, //标题 
                    lineWidth: 2 //基线宽度 
                  },
                  series: [
                    {
                      name: '波长[nm]',
                      data: res.body.data.data,
                    }
                  ]
                });
              })


            } else {
              return this.$dispatch('Warning:dispatch', '该时间内无光谱数据', 'fail');
            }
          })
        }
      }


    }
  },
  events: {
    'getParentStation'(station) {
      this.station = station;
    },
    checkNode(station) {
      this.showZtree = false;
      this.treeStatus = false;
      this.$broadcast('getAllCheckedNodes');
    },
    getCheckList(list) {
      let stations = [];
      for (let i = 0; i < list.length; i++) {
        if (list[i].is_station && list[i].id && list[i].id !== JSON.parse(sessionStorage.getItem('station')).id) {
          stations.push(list[i]);
        }
      }

      if (stations.length > this.staionsNumberLimit) {
        this.$dispatch('Warning:dispatch', '对比站点不可超过'+this.staionsNumberLimit+1+'个', 'fail');
        return;
      } else {
        const resource = this.$resource('/apis/data/analysis{/id}/folding');

        for (let i of this.factorsList) {
          this.factorsObj[i.db_field] = { db_field: i.db_field, m_unit: i.m_unit, name: i.name, list: [] }
        }

        resource.get({
          id: this.saveStation
        }).then((res) => {
          this.drawLine(res);
        })

        for (let station of stations) {
          resource.get({
            id: station.id
          }).then((res) => {
            this.drawLine(res);
          })
        }
      }


    }
  }
}
</script>