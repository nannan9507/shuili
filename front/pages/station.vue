<template>
<div class="container single station">
  <div class="container-box">

    <header>
      <h2>
        {{ station.name || '&nbsp;' }}
      </h2>
      <span style="float: right;">
        <ztree name="station" type="station-select"></ztree>
      </span>
      
      <nav-select from="navList"></nav-select>
    </header>
    
    <component :is="currentView"></component>

<!--     <new-data v-show=" type_selector === '最新数据' "></new-data>
    <trace-analysis v-show=" type_selector === '曲线分析' "></trace-analysis>
    <history-records v-show=" type_selector === '报表统计' "></history-records>
    <station-data v-show=" type_selector === '站点资料' "></station-data>
    <message-log v-show=" type_selector === '通讯日志' "></message-log> -->
    <!-- <station-users></station-users> -->
  </div>
</div>
</template>

<script>
import NavSelect from '../components/NavSelect'
import config from '../helper/config'
import ztree from '../components/Ztree'
import { requestHandler } from '../services/index.js'

import newData from './template/newData'
import traceAnalysis from './template/traceAnalysis'
import historyRecords from './template/historyRecords'
import stationData from './template/stationData'
import messageLog from './template/messageLog'
import stationUsers from './template/stationUsers'

export default {
  components: {
    NavSelect,
    newData,
    traceAnalysis,
    historyRecords,
    stationData,
    messageLog,
    stationUsers,
    ztree
  },
  data() {
    return {
      station: {},
      stations: [],
      type_selector: '',
      currentView: '',
      title: ''
    }
  },
  watch: {
    'station'(n, o) {
      sessionStorage.setItem('station', JSON.stringify(n));
      this.$broadcast('getParentStation', n);
    }
  },
  ready() {

    for (let i of this.stations) {
      if (i.id === node.id) {
        this.station = i;
      }
    }

    requestHandler('getOrgTree', {}, (res) => {
      if (res.body.data && res.body.data.length > 0) {
        if (res.body.data.length > 0) {
          sessionStorage.setItem('station', JSON.stringify(res.body.data[0]));
          this.stations = res.body.data;
          new Promise((resolve) => {
            resolve()
          }).then(() => {
            this.$broadcast('createZtree', res.body.data)
          }).then(() => {
            if (sessionStorage.getItem('flag')) {
              this.$broadcast('getParamsNode', JSON.parse(sessionStorage.getItem('pre_station')));
              sessionStorage.removeItem('flag');
              sessionStorage.removeItem('pre_station');
            } else {
              for (let i of res.body.data) {
                if (i.is_station) {
                  this.$broadcast('getParamsNode', i);
                  break;
                }
              }
            }
          })
        }
      }
    })
    
  },
  events: {
    type(name) {
      const obj = {
        '最新数据': 'new-data',
        '曲线分析': 'trace-analysis',
        '报表统计': 'history-records',
        '站点资料': 'station-data',
        '通讯日志': 'message-log'
      }
      this.currentView = obj[name];
      this.title = name;
      document.title = this.station.name+'-'+this.title;
    },
    nodeToStation(node) {
      for (let i of this.stations) {
        if (i.id === node.id) {
          this.station = i;
          document.title = this.station.name+'-'+this.title;
        }
      }
    }
  },
  route: {
    activate() {
      // 获取active
      this.$dispatch('reSendChangeActive');
      if (sessionStorage.getItem('flag')) {
        this.currentView = 'new-data';
      }

      document.title = '站点监控';
    }
  }
}
</script>