<template>
<div class="all-log">

  <table class="table-header">
    <thead>
      <th>#</th>
      <th>发生站点</th>
      <th>发生时间</th>
      <th>告警类型</th>
      <th>告警对象</th>
      <th>触发条件</th>
    </thead>
    <tbody>
      <tr v-for="item in showList">
        <td>{{ $index + 1 + index }}</td>
        <td>{{ station.name }}</td>
        <td>{{ item.strDate }}</td>
        <td>{{ item.type === 1 ? "阈值告警" : "关联告警" }}</td>
        <td><span style="color: #454a51; cursor: default;" :title="item.factor">{{ item.factor.length > 30 ? item.factor.substring(0, 27) + '...' : item.factor }}</span></td>
        <td><span style="color: #454a51; cursor: default;" :title="item.condition">{{ item.condition.length > 30 ? item.condition.substring(0, 27) + '...' : item.condition }}</span></td>
      </tr>
    </tbody>
  </table>

  <pagination></pagination>
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

import { requestHandler } from '../../services/index.js'
import Pagination from '../../components/Pagination.vue'

export default {
  components: {
    Pagination
  },
  data() {
    return {
      time: {
        start: '',
        end: ''
      },
      station: { name: '' },
      type: null,
      list: [],
      showList: []
    }
  },
  methods: {
    getAllLogs() {
      const resource = this.$resource('/apis/data/stations/alarms/find');

      resource.get({
        start: this.time.start,
        end: this.time.end,
        type: this.type
      }).then((res) => {
        if (res.body.data && res.body.data.length > 0) {
          for (let i of res.body.data) {
            i.strDate = formatDateTime(new Date(i.datatime));
            let factors = [];

            // j => item
            for (let j of i.items) {
              if (j.factor) {
                factors.push({ name: j.factor.name, value: j.factor.value, condition: j.condition, m_unit: j.factor.m_unit })
              }
            }

            i.factors = factors;
          };

          for (let i of res.body.data) {
            let fac = '';
            let condi = '';
            for (let j of i.factors) {
              fac += `${j.name}: ${j.value}${j.m_unit}; `
              condi += `${j.condition}`
            }
            i.factor = fac;
            i.condition = condi;
          }

          this.list = res.body.data;

          // 获取分页总页
          this.$broadcast('getPaginationList', this.list);
        } else {
          this.list = [];
          this.$broadcast('getPaginationList', this.list);
        }
      })
    },
    getAlarms(station) {
      this.showList = [];
      const resource = this.$resource('/apis/data/alarms{/id}');

      resource.get({
        id: station.id,
        start: this.time.start,
        end: this.time.end,
        type: this.type
      }).then((res) => {
        if (res.body.data && res.body.data.length > 0) {
          for (let i of res.body.data) {
            i.strDate = formatDateTime(new Date(i.datatime));
            let factors = [];

            // j => item
            for (let j of i.items) {
              if (j.factor) {
                factors.push({ name: j.factor.name, value: j.factor.value, condition: j.condition, m_unit: j.factor.m_unit })
              }
            }

            i.factors = factors;
          };

          for (let i of res.body.data) {
            let fac = '';
            let condi = '';
            for (let j of i.factors) {
              fac += `${j.name}: ${j.value}${j.m_unit}; `
              condi += `${j.condition}`
            }
            i.factor = fac;
            i.condition = condi;
          }

          this.list = res.body.data;

          // 获取分页总页
          this.$broadcast('getPaginationList', this.list);
        } else {
          this.list = [];
          this.$broadcast('getPaginationList', this.list);
        }
      })
    }
  },
  events: {
    'receiveParams'(time, type, station) {
      this.time = time;
      this.type = type;

      if ($.isEmptyObject(station)) {
        if (type === null) {

          this.getAllLogs();
        }
      } else {
        if (type === null) {
          this.station = station;

          this.getAlarms(station);
        }
      }
    },
    'paginateTmp'(tmp) {
      this.index = tmp.currentIndex;
      this.showList = tmp.showList;
    }
  }
}
</script>