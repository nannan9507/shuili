<template>
<div class="message-log">
  <div class="line" v-for="item in showList">
    <div class="icon" :class="{ 'connection': item.connected, 'disconnection': !item.connected }"></div>
    <div class="time-line">{{ item.formatTime }}</div>
    <div class="describe">站点[{{ station_name }}]{{ item.connected ? '建立' : '断开' }}连接</div>
  </div>

  <pagination></pagination>
</div>
</template>

<script>
import Vue from 'vue'
import { requestHandler } from '../../services/index.js'
import Pagination from '../../components/Pagination.vue'


Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

export default {
  components: {
    Pagination
  },
  data() {
    return {
      list: [],
      showList: [],
      station_name: '',
      station: {},
    }
  },
  watch: {
    'station'(n, o) {
      this.getLogs(n);
      this.station_name = n.name;
    }
  },
  ready() {
    if (JSON.parse(sessionStorage.getItem('station'))) {
      this.station_name = JSON.parse(sessionStorage.getItem('station')).name;
      this.getLogs(JSON.parse(sessionStorage.getItem('station')));
    }
  },
  methods: {
    getLogs(station) {
      this.showList = [];

      const resource = this.$resource('/apis/data/logs');
      if (station && station.id) {
        resource.get({
          id: station.id
        }).then(function (res) {
          if (res.body.success && res.body.data.length > 0) {
            for (let i of res.body.data) {
              i.formatTime = new Date(i.add_time).Format('yyyy-MM-dd hh:mm:ss')
            }

            this.list = res.body.data || [];

            // 获取分页总页
            this.$broadcast('getPaginationList', this.list);

          }
        })
      }
    }
  },
  events: {
    'getParentStation'(station) {
      this.station = station;
    },
    'paginateTmp'(tmp) {
      this.index = tmp.currentIndex;
      this.showList = tmp.showList;
    }
  }
}
</script>