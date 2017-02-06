<template>
<div class="container single data">
  <div class="container-box">
    <div class="origin-data">
      <header>
        <nav-select :list="navSelect"></nav-select>
      </header>

      <div class="explain" v-show="type_selector === '数据补登'">
        说明： 根据每日监控频次来查看时间段内是否缺少监测数据，默认为每日12次监测
      </div>

      <div class="line" style="overflow: hidden;">
        <div class="timePicker" style="float: left; margin-top: 10px;">
          <div class="input-daterange" data-provide="datepicker">
            <input style="border: 1px solid #ccc; text-align: left;" type="text" class="time-input time1" id="time1" /> 
            <span style="color: #666;">-</span>
            <input style="border: 1px solid #ccc; text-align: left;" type="text" class="time-input time2" id="time2" /> 
          </div>
        </div>

        <span style="float: left; margin-top: 10px; margin-left: 20px;" v-show="type_selector === '数据补登'">
          <input class="time-input" type="number" id="count" v-model="count" placeholder="每日监测频次" min="1" />
        </span>

        <span style="float: left; margin-top: 32px; margin-left: 20px;" v-show="type_selector === '数据补登'">
          <button class="button-setting-big" @click="getStationByCount(count)">查询</button>
        </span>

        <span style="float: right; margin-top: 30px;">
          <ztree name="origin" type="station-select"></ztree>
        </span>
      </div>


      <div class="page" v-show="type_selector === '数据补登'">
        <table class="table-header">
          <thead>
            <th>#</th>
            <th>站点</th>
            <th>日期</th>
            <th>现有数据</th>
            <th>操作</th>
          </thead>
          <tbody>
            <tr v-for="item in showList">
              <td>{{ $index + 1 }}</td>
              <td>{{ station.name }}</td>
              <td>{{ item.dateStr }}</td>
              <td><a style="color: #2277da; cursor: pointer;" @click="openSearch(item)">{{ item.count }}条</a></td>
              <td><a style="color: #2277da; cursor: pointer;" @click="saveData(item)">补登</a></td>
            </tr>
          </tbody>
        </table>

        <pagination></pagination>
      </div>

      <div class="page" v-show="type_selector === '补登记录'">
        <div class="table-container" style="margin-top: 30px;">
          <div class="headcol">
            <table class="left">
              <thead>
                <th v-if="list && list.length > 0">站点</th>
                <th v-show="list.length > 0">时间</th>
                <th v-if="list && list.length > 0">补登人</th>
                <th v-if="list && list.length > 0">补登时间</th>
                <th v-if="list && list.length > 0">原因</th>
              </thead>
              <tbody>
                <tr v-for="station in showList">
                  <td>{{ station.station_name }}</td>
                  <td>{{ station.time }}</td>
                  <td>{{ station.editor }}</td>
                  <td>{{ station.editor_time }}</td>
                  <td><span title="{{ station.comment }}">{{ station.comment_lite }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="right">
            <table>
              <thead>
                <th v-for="item in thead_add">{{ item.name }}<span v-show="item.m_unit">({{ item.m_unit }})</span></th>
              </thead>
              <tbody>
                <tr v-for="station in showList">
                  <td v-for="factor in station.data">{{ factor.value }}</td>
                </tr>
              </tbody>
            </table>

          </div>
        </div>
        <pagination></pagination>
      </div>

    </div>
  </div>
</div>
</template>

<script>
import Vue from 'vue'
import $ from 'jquery'
import moment from 'moment'
import ztree from '../components/Ztree.vue'
import SimulateTable from '../components/SimulateTable.vue'
import NavSelect from '../components/NavSelect.vue'
import Pagination from '../components/Pagination.vue'
import { requestHandler } from '../services/index.js'
import '../styles/jquery.datetimepicker.css'
import '../styles/bootstrap-datepicker.standalone.css'
import '../services/bootstrap-datepicker.min.js'
import '../services/bootstrap-datepicker.zh-CN.min.js'

var formatDateTime = function (date, type) {  
  var y = date.getFullYear();  
  var m = date.getMonth() + 1;  
  m = m < 10 ? ('0' + m) : m;  
  var d = date.getDate();  
  d = d < 10 ? ('0' + d) : d;
  var h = date.getHours();
  h = h < 10 ? ('0' + h) : h;  
  var minute = date.getMinutes();  
  minute = minute < 10 ? ('0' + minute) : minute;
  if (type === 1) {
     return y + '-' + m + '-' + d; 
  } else {
    return y + '-' + m + '-' + d+' '+h+':'+minute; 
  }
};  

export default {
  components: {
    ztree,
    SimulateTable,
    NavSelect,
    Pagination
  },
  route: {
    activate() {
      this.getStationByCount('');
    }
  },
  watch: {
    'station'(n, o) {
      if (this.type_selector === '数据补登') {
        this.getStationByCount('');
      } else {
        this.getHistories();
      }
    }
  },
  data() {
    return {
      list: [],
      count: '',
      time: {
        start: '',
        end: ''
      },
      thead_add: [],
      arr: [],
      station_name: '',
      showList: [],
      searchList: [],
      station: {},
      date: '',
      navSelect: [{ name: '数据补登', active: false }, { name: '补登记录', active: false }],
      timer: '',
      type_selector: ''
    }
  },
  ready() {
    const _that = this;
    $('body').delegate('input', 'click', function () {
      if (this.id === 'timeDetail') {
        _that.timer = moment(_that.date).startOf('minute').format('YYYYMMDDHHmmSS');

        new Promise((resolve, reject) => {
          resolve();
        }).then(() => {
          $(this).datetimepicker({
            format: 'yyyy/mm/dd hh:ii',
            weekStart: 1,
            language: "zh-CN",
            autoclose: true,
            todayHighlight: true,
            startView: 0,
            maxView: 4
          }).on('changeDate', (e) => {
            _that.timer = moment(e.date).startOf('minute').format('YYYYMMDDHHmmSS');
          })
        }).then(() => {
          if ($(this).val() === '') {
            $(this).val(moment(_that.date).format('YYYY-MM-DD HH:mm'))
            this.blur();
          }

        })
      }
    })


    if (JSON.parse(sessionStorage.getItem('station'))) {
      this.station_name = JSON.parse(sessionStorage.getItem('station')).name;
    }

    // getOrgTree
    const resource = this.$resource('/apis/station/stations/tree');

    resource.get({
      type: 'a'
    }).then((res) => {
      if (res.body.data.length > 0) {
        this.stations = res.body.data;
        new Promise((resolve) => {
          resolve()
        }).then(() => {
          if (res.body.data.length > 0) {
            this.$broadcast('createZtree', res.body.data)
          }
        }).then(() => {
          for (let i of res.body.data) {
            if (i.is_station) {
              this.$broadcast('getParamsNode', i);
              break;
            }
          }
        })
      }
    })

    const that = this;

    this.time.start = moment().subtract(7, "days").startOf('day').format('YYYY/MM/DD');
    this.time.end = moment().endOf('day').format('YYYY/MM/DD');

    $('#time1').val(moment().subtract(7, "days").startOf('day').format('YYYY/MM/DD'))
    $('#time2').val(moment().endOf('day').format('YYYY/MM/DD'))


    $('.input-daterange input').each(function () {
      $(this).datepicker({
        format: 'yyyy-mm-dd',
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
      })
      
    })

  },
  methods: {
    getStationByCount(count) {
      this.thead_add = [];
      this.list = [];
      this.showList = [];

      this.type_selector = '数据补登';
      for (let i of this.navSelect) {
        i.active = false;
      }
      this.navSelect[0].active = true;

      const resource = this.$resource('apis/data/lost/histories{/id}')

      if (this.station && this.station.id) {
        resource.get({
          id: this.station.id,
          start: this.time.start,
          end: this.time.end,
          count: count
        }).then((res) => {
          if (res.body.data && res.body.data.length > 0) {
            this.arr = res.body.data;

            for (let i of this.arr) {
              i.dateStr = formatDateTime(new Date(i.datadate), 1);
              i.station_name = JSON.parse(sessionStorage.getItem('station')).name
            }

            // 获取分页总页
            this.$broadcast('getPaginationList', this.arr);

            this.$nextTick(() => {
              $('.table-container tr').on('mouseover', function () {
                const index = $(this).index();

                $($('.left tbody tr')[index]).addClass('hover-action');
                $($('.right tbody tr')[index]).addClass('hover-action');
              })

              $('.table-container tr').on('mouseout', function () {
                const index = $(this).index();
                
                $($('.left tbody tr')[index]).removeClass('hover-action');
                $($('.right tbody tr')[index]).removeClass('hover-action');
              })
            })

          }
        })
      } else {
        if (JSON.parse(sessionStorage.getItem('station'))) {
          resource.get({
            id: JSON.parse(sessionStorage.getItem('station')).id,
            start: this.time.start,
            end: this.time.end,
            count: count
          }).then((res) => {
            if (res.body.data && res.body.data.length > 0) {
              this.arr = res.body.data;

              for (let i of this.arr) {
                i.dateStr = formatDateTime(new Date(i.datadate), 1);
                i.station_name = JSON.parse(sessionStorage.getItem('station')).name
              }

              // 获取分页总页
              this.$broadcast('getPaginationList', this.arr);

              this.$nextTick(() => {
                $('.table-container tr').on('mouseover', function () {
                  const index = $(this).index();

                  $($('.left tbody tr')[index]).addClass('hover-action');
                  $($('.right tbody tr')[index]).addClass('hover-action');
                })

                $('.table-container tr').on('mouseout', function () {
                  const index = $(this).index();
                  
                  $($('.left tbody tr')[index]).removeClass('hover-action');
                  $($('.right tbody tr')[index]).removeClass('hover-action');
                })
              })
            }
          })
        }
      }
      

    },
    getHistories() {
      this.list = [];
      this.showList = [];
      this.thead_add = [];

      const resource = this.$resource('apis/data/history/append/log')

      resource.get({
        id: this.station.id,
        start: this.time.start,
        end: this.time.end
      }).then((res) => {
        if (res.body.data && res.body.data.length > 0) {
          this.simulateStation(res.body.data);
        } else {
          this.$broadcast('getPaginationList', this.list);
        }
      })
    },
    simulateStation(stations=[]) {
      this.list = [];
      this.thead_add = [];
      this.showList = [];


      let list = [];
      let factors = {};

      for (let station of stations) {
        let _data = { id: station.id, time: formatDateTime(new Date(station.datatime)), datatime: station.datatime, data: [], audit_state: station.audit_state, data_source: station.data_source, station_name: JSON.parse(sessionStorage.getItem('station')).name, editor: station.editor, editor_time: formatDateTime(new Date(station.editor_time)), comment: station.comment, comment_lite: station.comment.length < 10 ? station.comment : station.comment.substring(0, 7)+'...' }
        // 单个站点
        for (let i in station.history_json) {

          let factor = station.history_json[i];

          if (!factors[i]) {            
            factors[i] = { id: factor.id, db_field: factor.db_field, m_unit: factor.m_unit, name: factor.name, db_field: factor.db_field }
          }

          if (!factor.value) {
            if (factor.value === 0) {
              factor.value = 0;
            } else {
              factor.value = '-'
            }
          }

          _data.data.push(factor);
        }

        list.push(_data);
      }

      for (let i in factors) {
        this.thead_add.push(factors[i]);
      }

      // 站点数
      this.list = list;

      // 获取分页总页
      this.$broadcast('getPaginationList', this.list);

      this.$nextTick(() => {
        $('.table-container tr').on('mouseover', function () {
          const index = $(this).index();

          $($('.left tbody tr')[index]).addClass('hover-action');
          $($('.right tbody tr')[index]).addClass('hover-action');
        })

        $('.table-container tr').on('mouseout', function () {
          const index = $(this).index();
          
          $($('.left tbody tr')[index]).removeClass('hover-action');
          $($('.right tbody tr')[index]).removeClass('hover-action');
        })
      })
    },
    openSearch(history) {
      const resource = this.$resource('apis/data/stations{/id}/hour')
      resource.get({
        id: history.station_id || JSON.parse(sessionStorage.getItem('station')).id,
        start: moment(history.datadate).startOf('day').format('YYYY/MM/DD'),
        end: moment(history.datadate).endOf('day').format('YYYY/MM/DD')
      }).then((res) => {
        if (res.body.data) {
          const times = [];
          for (let i in res.body.data) {
            times.push(formatDateTime(new Date(i)));
          }

          if (times.length === 0) {
            return this.$dispatch('Warning:dispatch', '选中站点无该日监测数据', 'fail');
          }

          this.$dispatch('openMask');
          const that = this;
          this.modal = Vue.modal({
            data() {
              return {
                modal: {
                  title: '已采集数据',
                  show: true
                },
                times: times,
                station: that.station,
                config: {
                  prevStr: '上一页',
                  nextStr: '下一页',
                  lastStr: '末页',
                  firstStr: '首页',
                  currentPage: 1,
                  itemsPerPage: 9,
                  pagesLength: 5,
                  totalItems: 0,
                  onChange() {}
                }
              }
            },
            template: `
              <div class="modal" v-show="modal.show">
                <div class="mask"></div>
                <div class="paper">
                  <div class="header">
                    <h3 style="float: left; margin-left: 40px; color: #999;">{{ modal.title }}</h3>
                    <div class="close" @click="closeModal"></div>
                  </div>
                  <div class="content" style="padding-top: 5px; padding-bottom: 5px; text-align: center;">
                    <table style="width: 100%; text-align: center; padding: 5px 10px 5px 10px;">
                      <thead>
                        <th>站点名</th>
                        <th>数据采集时间</th>
                      </thead>
                      <tr style="height: 45px;" v-for="time in times">
                        <td style="border-top: 1px solid #e7ecf1; font-size: 14px;">{{ station.name }}</td>
                        <td style="border-top: 1px solid #e7ecf1; font-size: 14px;">{{ time }}</td>
                      </tr>
                    </table>
                    <vue-pagination :pagination-config.sync="config"></vue-pagination>
                  </div>
                </div>
              </div>
            `,
            methods: {
              closeModal() {
                that.$dispatch('closeMask');
                this.modal.show = false;
              },
            }
          })
        } else {
          this.$dispatch('Warning:dispatch', '数据有误', 'fail');
        }
      })
    },
    saveData(history) {
      this.timer = '';
      this.date = history.datadate;
      let factors = {};
      let factors_list = [];
      const resource = this.$resource('apis/station/factor{/id}')

      resource.get({
        id: history.station_id
      }).then((res) => {
        if (res.body.data && res.body.data.length > 0) {
          for (let i of res.body.data) {
            if (i.selected) {
              factors[i.db_field] = 0;

              let obj = {...i};
              factors_list.push(obj);
            }
          }

          this.$dispatch('openMask');
          const that = this;
          this.modal = Vue.modal({
            data() {
              return {
                modal: {
                  title: '数据补登',
                  show: true
                },
                factors_list: factors_list,
                factors: factors,
                comment: '',
                config: {
                  prevStr: '上一页',
                  nextStr: '下一页',
                  lastStr: '末页',
                  firstStr: '首页',
                  currentPage: 1,
                  itemsPerPage: 9,
                  pagesLength: 5,
                  totalItems: 0,
                  onChange() {},
                  timer: moment(history.datadate).startOf('minute').format('YYYYMMDDHHmmSS')
                }
              }
            },
            template: `
              <div class="modal" v-show="modal.show">
                <div class="mask"></div>
                <div class="paper">
                  <div class="header">
                    <h3>{{ modal.title }}</h3>
                    <div class="close" @click="closeModal"></div>
                  </div>
                  <div class="content" style="padding-top: 5px; padding-bottom: 5px;">
                    <table style="width: 100%; text-align: center;">
                      <tbody>
                        <tr>
                          <td align="right" style="font-size: 14px; color: #999;">补登时间</td>
                          <td><input class="time-input" style="border: 1px solid #CCC; padding: 10px; width: 70%; margin-top: 10px; margin-bottom: 10px; border-radius: 5px; float: left; margin-left: 20px;" type="text" id="timeDetail" placeholder="补登时间"/></td>
                        </tr>
                        <tr v-for="factor in factors_list" style="height: 40px;">
                          <td align="right" style="font-size: 14px; color: #999;">{{ factor.name }}</td>
                          <td><input style="border: 1px solid #CCC; padding: 10px; width: 70%; margin-top: 10px; margin-bottom: 10px; border-radius: 5px; float: left; margin-left: 20px;" type="number" step="0.001" @change="changeVal(factor, $event)" min="0"  @mouseover="color($event)" @mouseout="colorBack($event)" /></td>
                        </tr>
                        <tr>
                          <td align="right" style="font-size: 14px; color: #999;">添加说明</td>
                          <td><textarea style="width: 85%; margin-top: 20px; margin-bottom: 20px; resize: none; outline: none; padding: 2px 5px; border: 1px solid #CCC;" cols="35" rows="4" v-model="comment" @mouseover="color($event)" @mouseout="colorBack($event)"></textarea></td>
                        </tr>
                      </tbody>
                    </table>
                    <vue-pagination :pagination-config.sync="config"></vue-pagination>
                  </div>
                  <div class="footer">
                    <button class="button-setting" style="margin-top: 10px; margin-bottom: 10px; float: right; margin-right: 10px;" @click="signup">补登</button>
                  </div>
                </div>
              </div>
            `,
            methods: {
              color(e) {
                e.target.style.border = '1px solid #2277da';
              },
              colorBack(e) {
                e.target.style.border = '1px solid #CCC';
              },
              closeModal() {
                that.$dispatch('closeMask');
                this.modal.show = false;
              },
              changeVal(factor, event) {
                factor.value = event.target.value;
              },
              signup() {
                for (let i of this.factors_list) {
                  this.factors[i.db_field] = parseFloat(i.value)
                }

                const resource = this.$resource('/apis/data/histories')

                resource.save({}, {
                  station_id: history.station_id,
                  datatime: that.timer,
                  data_json: this.factors,
                  comment: this.comment
                }).then((res) => {
                  if (res.body.success) {
                    that.$dispatch('Warning:dispatch', '补登成功', 'success');
                    this.closeModal();
                    that.getStationByCount();
                  } else {
                    that.$dispatch('Warning:dispatch', res.body.message, 'success');
                  }
                })
              }
            }
          })
        }
      })
    }
  },
  events: {
    nodeToStation(node) {
      for (let i of this.stations) {
        if (i.id === node.id) {
          this.station = i;
          sessionStorage.setItem('station', JSON.stringify(i));
          this.station_name = i.name;
          document.title = this.station.name+'-'+'数据补登';
        }
      }
    },
    'paginateTmp'(tmp) {
      this.index = tmp.currentIndex;
      this.showList = tmp.showList;
    },
    type(name) {
      this.showList = [];
      this.type_selector = name;
      if (name === '数据补登') {
        if (!this.time.start && !this.time.end) {
          this.time.start = moment().subtract(7, "days").startOf('day').format('YYYY/MM/DD');
          this.time.end = moment().endOf('day').format('YYYY/MM/DD');

          this.getStationByCount('');
        } else {
          this.getStationByCount('');
        }
        
      } else {
        this.getHistories();
      }
    },
  }
}
</script>