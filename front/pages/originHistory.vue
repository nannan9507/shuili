<template>
<div class="container single data">
  <div class="container-box">
    <div class="origin-data">
      <h3>历史数据</h3>
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

      <div class="table-container" style="margin-top: 30px;">
        <div class="headcol">
          <table class="left">
            <thead>
              <th v-if="list && list.length > 0">站点</th>
              <th v-if="list && list.length > 0">时间</th>
            </thead>
            <tbody>
              <tr v-for="i in showList">
                <td>{{ i.station_name }}</td>
                <td>{{ i.time }}</td>
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
              <tr v-for="i in showList">
                <td v-for="j in i.data">{{ j.value }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <pagination></pagination>

    </div>
  </div>
</div>
</template>

<script>
import $ from 'jquery'
import moment from 'moment'
import ztree from '../components/Ztree.vue'
import SimulateTable from '../components/SimulateTable.vue'
import { requestHandler } from '../services/index.js'
import Pagination from '../components/Pagination.vue'
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
    Pagination
  },
  data() {
    return {
      time: {
        start: '',
        end: ''
      },
      list: [],
      showList: [],
      thead_add: [],
      station: {}
    }
  },
  watch: {
    'station'(n, o) {
      this.getData(n);
    }
  },
  ready() {
    requestHandler('getOrgTree', {}, (res) => {
      if (res.body.data && res.body.data.length > 0) {
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

        that.getData();      
      })
      
    })

  },
  methods: {
    getData(station) {
      this.showList = [];
      this.list = [];

      const resource = this.$resource('/apis/data/histories{/id}');
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
          id: id,
          start: this.time.start,
          end: this.time.end
        }).then((res) => {
          if (res.body.success) {
            if (!$.isEmptyObject(res.body.data)) {
              this.simulateTimeline(res.body.data);
            }
          }
        })
      }
    },
    simulateTimeline(item) {
      this.thead_add = [];

      let factors = {};
      let list = [];
      let _list = [];

      for (let i in item) {
        list[i] = { time: formatDateTime(new Date(i)), data: [], station_name: this.station.name }

        for (let j in item[i]) {
          if (!factors[j]) {
            factors[j] = { name: item[i][j].name, db_field: item[i][j].db_field, m_unit: item[i][j].m_unit };
          }

          if (!item[i][j].value) {
            if (item[i][j].value === 0) {
              item[i][j].value = 0;
            } else {
              item[i][j].value = '-';
            }
          }

          list[i].data.push({ value: item[i][j].value, m_unit: item[i][j].m_unit })
        }
      }

      // obj => array
      for (let i in factors) {
        this.thead_add.push(factors[i]);
      }

      for (let i in list) {
        _list.push(list[i]);
      }


      this.list = _list;

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
    }
  },
  events: {
    nodeToStation(node) {
      for (let i of this.stations) {
        if (i.id === node.id) {
          this.station = i;
          document.title = this.station.name+'-'+'历史数据';
        }
      }

      if (sessionStorage.getItem('flag') && JSON.parse(sessionStorage.getItem('pre_station'))) {
        this.station = JSON.parse(sessionStorage.getItem('pre_station'));

        sessionStorage.removeItem('flag');
        sessionStorage.removeItem('pre_station');
      }
    },
    'paginateTmp'(tmp) {
      this.index = tmp.currentIndex;
      this.showList = tmp.showList;
    }
  },
  route: {
    activate() {
      this.$dispatch('reSendOpenNone');
    }
  }
}
</script>