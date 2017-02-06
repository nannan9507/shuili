<style scoped>
  .table-container .right td {
    cursor: pointer;
  }

  .table-container .right td:hover {
    color: #2277da;
  }

  .modal table td {
    font-size: 14px;
  }
</style>

<template>
<div class="container single data">
  <div class="container-box">
    <div class="origin-data">
      <header>
        <nav-select :list="navSelect"></nav-select>
      </header>
      <div class="line" style="overflow: hidden;">
        <div class="timePicker" style="float: left; margin-top: 10px;">
          <div class="input-daterange" data-provide="datepicker">
          <input style="border: 1px solid #ccc; text-align: left;" type="text" class="time-input time1" id="time1" /> 
          <span style="color: #666;">-</span>
          <input style="border: 1px solid #ccc; text-align: left;" type="text" class="time-input time2" id="time2" /> 
          </div>
        </div>

        <span style="float: right; margin-top: 30px;">
          <ztree name="origin" type="station-select"></ztree>
        </span>
      </div>
      
      <div class="page" v-show="type_selector === '反审核'">
        <div class="table-container" style="margin-top: 30px;">
          <div class="headcol">
            <table class="left">
              <thead>
                <th v-if="list && list.length > 0">站点</th>
                <th v-show="list.length > 0">时间</th>
                <th v-show="list.length > 0">操作</th>
              </thead>
              <tbody>
                <tr v-for="record in showList">
                  <td>{{ record.station_name }}</td>
                  <td>{{ record.time }}</td>
                  <td><button class="button-setting" @click="reverse(record)">反审核</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="right">
            <table>
              <thead>
                <th v-for="item in thead_add">{{ item.name }} <span v-show="item.m_unit">({{ item.m_unit }})</span></th>
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

      <div class="page" v-show="type_selector === '反审核记录'">
        <div class="table-container" style="margin-top: 30px;">
          <div class="headcol">
            <table class="left">
              <thead>
                <th v-if="list && list.length > 0">站点</th>
                <th v-show="list.length > 0">时间</th>
                <th v-if="list && list.length > 0">审核人</th>
                <th v-if="list && list.length > 0">审核时间</th>
                <th v-if="list && list.length > 0">原因</th>
              </thead>
              <tbody>
                <tr v-for="station in showList">
                  <td>{{ station.station_name }}</td>
                  <td>{{ station.time }}</td>
                  <td>{{ station.editor }}</td>
                  <td>{{ station.editor_time }}</td>
                  <td><span title="{{ station.comment }}">{{ station.comment ? ( station.comment.length < 10 ? station.comment : station.comment.substring(0, 7)+'...' ) : '' }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="right">
            <table>
              <thead>
                <th v-for="item in thead_add">{{ item.name }} <span v-show="item.m_unit">({{ item.m_unit }})</span></th>
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
import Pagination from '../components/Pagination.vue'
import { requestHandler } from '../services/index.js'
import NavSelect from '../components/NavSelect'
import '../styles/jquery.datetimepicker.css'
import '../styles/bootstrap-datepicker.standalone.css'
import '../services/bootstrap-datepicker.min.js'
import '../services/bootstrap-datepicker.zh-CN.min.js'

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

export default {
  components: {
    ztree,
    SimulateTable,
    Pagination,
    NavSelect
  },
  data() {
    return {
      navSelect: [{ name: '反审核', active: false }, { name: '反审核记录', active: false }],
      list: [],
      showList: [],
      thead_add: [],
      count: '',
      station: {},
      time: {
        start: '',
        end: ''
      },
      type_selector: '',
    }
  },
  watch: {
    'station'(n, o) {
      if (this.type_selector === '反审核') {
        this.getData(n);
      } else if (this.type_selector === '反审核记录') {
        this.getHistories(n);
      }
    }
  },
  ready() {
    // getOrgTree
    const resource = this.$resource('/apis/station/stations/tree');

    resource.get({
      type: 's'
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
    $('#time1').val(moment().subtract(7, "days").startOf('day').format('YYYY/MM/DD'))
    $('#time2').val(moment().endOf('day').format('YYYY/MM/DD'))
    this.time = {
      start: moment().subtract(7, "days").startOf('day').format('YYYY/MM/DD'),
      end: moment().endOf('day').format('YYYY/MM/DD')
    }

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
          if (that.type_selector === '反审核') {
            that.getData();
          } else if (that.type_selector === '反审核记录') {
            that.getHistories();
          }
        }
      })
      
    })

  },
  methods: {
    reverse(record) {
      this.$dispatch('openMask');
      const that = this;
      this.modal = Vue.modal({
        data() {
          return {
            modal: {
              show: true
            },
            comment: '',
          }
        },
        template: `
          <div class="modal" v-show="modal.show">
            <div class="mask"></div>
            <div class="paper">
              <div class="header">
                <h3>反审核</h3>
                <div class="close" @click="closeModal"></div>
              </div>
              <div class="content" style="padding-top: 5px; padding-bottom: 5px;">
                <table>
                  <tr>
                    <td style="font-size: 14px; color: #999;">反审核原因：</td>
                    <td><textarea style="resize: none; width: 300px; height: 50px; outline: none; padding: 5px; margin-top: 10px; border: 1px solid #CCC;" v-model="comment"></textarea></td>
                  </tr>
                </table>
              </div>
              <div class="footer">
                <button class="button-setting update" @click="signup">完成</button>
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
          signup() {
            const resource = that.$resource('/apis/data/histories{/id}');

            resource.update({
              id: parseInt(record.id),
            }, {
              comment: this.comment
            }).then((res) => {
              if (res.body.success) {
                that.$dispatch('Warning:dispatch', '修改成功', 'success');
              } else {
                that.$dispatch('Warning:dispatch', res.body.message, 'fail');
              }
            })

            that.$dispatch('closeMask');
            this.modal.show = false;
          }
        }
      })
    },
    getData(station) {
      this.thead_add = [];
      this.list = [];
      this.showList = [];

      const resource = this.$resource('/apis/data/history/update/log');
      let id;
      if (station) {
        id = station.id
        this.station = station
      } else {
        if (JSON.parse(sessionStorage.getItem('station'))) {
          id = JSON.parse(sessionStorage.getItem('station')).id
        }
      }

      if (id) {
        resource.get({
          station_id: id,
          start: this.time.start,
          end: this.time.end
        }).then((res) => {
          let thead_add = [];
          this.showList = [];

          this.simulateStation(res.body.data);
        })
      }

    },
    getHistories(station) {
      this.showList = [];
      this.list = [];
      this.thead_add = [];

      const resource = this.$resource('/apis/data/history/reverse/log');

      let id;
      if (station) {
        id = station.id
      } else {
        if (JSON.parse(sessionStorage.getItem('station'))) {
          id = JSON.parse(sessionStorage.getItem('station')).id
        }
      }

      if (id) {
        resource.get({
          station_id: id,
          start: this.time.start,
          end: this.time.end
        }).then((res) => {
          if (res.body.success) {
            this.simulateStation(res.body.data)
          }
        })

      }
    },
    simulateStation(records=[]) {
      this.list = [];
      this.thead_add = [];
      this.showList = [];


      let list = [];
      let factors = {};

      for (let record of records) {
        let _data = { id: record.id, time: formatDateTime(new Date(record.datatime)), datatime: record.datatime, data: [], audit_state: record.audit_state, data_source: record.data_source, station_name: JSON.parse(sessionStorage.getItem('station')).name, editor: record.editor, editor_time: formatDateTime(new Date(record.editor_time)), comment: record.comment }
        // 单个站点
        for (let i in record.history_json) {

          let factor = record.history_json[i];

          if (!factors[i]) {            
            factors[i] = { id: factor.id, db_field: factor.db_field, m_unit: factor.m_unit, name: factor.name }
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
    modify(station) {
      this.$dispatch('openMask');
      const that = this;
      this.modal = Vue.modal({
        data() {
          this.factors = station.data;
          return {
            modal: {
              show: true
            },
            id: that.station.id,
            station_id: station.station_id,
            datatime: station.datatime,
            data_json: {},
            comment: '',
            factor_value: 0
          }
        },
        template: `
          <div class="modal" v-show="modal.show">
            <div class="mask"></div>
            <div class="paper">
              <div class="header">
                <h3>数据修改</h3>
                <div class="close" @click="closeModal"></div>
              </div>
              <div class="content" style="padding-top: 5px; padding-bottom: 5px;">
                <table>
                  <tr v-for="factor in factors">
                    <td style="font-size: 14px; color: #999;">{{ factor.name }}：</td>
                    <td><input type="number" min="0" style="padding: 10px 5px; border: 1px solid #CCC; margin-top: 5px;" @mouseover="color($event)" @mouseout="colorBack($event)" :value="factor.value" @change="changeVal(factor, $event)" /></td>
                  </tr>
                  <tr>
                    <td style="font-size: 14px; color: #999;">修改原因：</td>
                    <td><textarea style="resize: none; width: 300px; height: 50px; outline: none; padding: 5px; margin-top: 10px; border: 1px solid #CCC;" v-model="comment"></textarea></td>
                  </tr>
                </table>
              </div>
              <div class="footer">
                <button class="button-setting update" @click="signup">完成</button>
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
            let factors = {};
            for (let i = 0; i < this.factors.length; i++) {
              factors[this.factors[i].db_field] = parseFloat(this.factors[i].value);
            }

            const resource = that.$resource('/apis/data/histories{/id}');

            resource.update({
              id: this.id
            }, {
              data_json: JSON.stringify(factors),
              comment: this.comment
            }).then((res) => {
              if (res.body.success) {
                that.$dispatch('Warning:dispatch', '修改成功', 'success');
              } else {
                that.$dispatch('Warning:dispatch', '修改失败', 'fail');
              }
              that.getData();
            })

            that.$dispatch('closeMask');
            this.modal.show = false;
          }
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
          document.title = this.station.name+'-'+'反审核';
        }
      }
    },
    'paginateTmp'(tmp) {
      this.index = tmp.currentIndex;
      this.showList = tmp.showList;
    },
    type(name) {
      this.type_selector = name;
      if (name === '反审核') {
        if (this.time.start && this.time.end) {
          this.getData();
        }
      } else {
        this.getHistories();
      }
    },
  }
}
</script>