<template>
<div class="container single log">
  <div class="container-box">
    <header>
      <nav-select from="navList"></nav-select>
    </header>
    <div class="line" style="overflow: hidden;">
      <div class="timePicker" style="float: left; margin-top: 10px;">
        <div class="input-daterange" data-provide="datepicker">
          <input style="border: 1px solid #ccc; text-align: left; margin-top: -20px;" type="text" class="time-input time1" id="time1" /> 
          <span style="color: #666;">-</span>
          <input style="border: 1px solid #ccc; text-align: left; margin-top: -20px;" type="text" class="time-input time2" id="time2" /> 
        </div>
      </div>

      <span style="float: right;">
        <ztree name="origin" type="station-select"></ztree>
      </span>
    </div>
    <all-log v-show=" type_selector === '全部告警' "></all-log>
    <concern-log v-show=" type_selector === '关联告警' "></concern-log>
    <threshold-log v-show=" type_selector === '阈值告警' "></threshold-log>
  </div>
</div>
</template>

<script>
import $ from 'jquery'
import moment from 'moment'
import ztree from '../components/Ztree.vue'
import SimulateTable from '../components/SimulateTable.vue'
import { requestHandler } from '../services/index.js'
import '../styles/jquery.datetimepicker.css'
import '../styles/bootstrap-datepicker.standalone.css'
import '../services/bootstrap-datepicker.min.js'
import '../services/bootstrap-datepicker.zh-CN.min.js'

import NavSelect from '../components/NavSelect'
import config from '../helper/config'

import allLog from './template/allLog'
import concernLog from './template/concernLog'
import thresholdLog from './template/thresholdLog'

export default {
  components: {
    ztree,
    NavSelect,
    allLog,
    concernLog,
    thresholdLog
  },
  data() {
    return {
      time: {
        start: moment().subtract(7, "days").startOf('day').format('YYYY/MM/DD'),
        end: moment().endOf('day').format('YYYY/MM/DD')
      },
      station: {},
      type: null,
      type_selector: ''
    }
  },
  watch: {
    'station'(n, o) {
      this.station = n;
    }
  },
  ready() {
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

    const that = this;

    $('#time1').val(moment().subtract(7, "days").startOf('day').format('YYYY/MM/DD'))
    $('#time2').val(moment().endOf('day').format('YYYY/MM/DD'))
    this.time.start = moment().subtract(7, "days").startOf('day').format('YYYY/MM/DD')
    this.time.end = moment().endOf('day').format('YYYY/MM/DD')
    that.$broadcast('receiveParams', this.time, this.type, this.station);

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

        that.$broadcast('receiveParams', that.time, that.type, that.station);
      })
    })

  },
  events: {
    nodeToStation(node) {
      for (let i of this.stations) {
        if (i.id === node.id) {
          this.station = i;
          document.title = this.station.name+'-告警日志';
          sessionStorage.setItem('station', JSON.stringify(i));

          this.$broadcast('receiveParams', this.time, this.type, this.station);
        }
      }
    },
    type(name) {
      this.type_selector = name;

      if (name === '全部告警') {
        this.type = null;
        return this.$broadcast('receiveParams', this.time, this.type, this.station);
      } else if (name === '阈值告警') {
        this.type = 1;
        return this.$broadcast('receiveParams', this.time, this.type, this.station);
      } else if (name === '关联告警') {
        this.type = 2;
        return this.$broadcast('receiveParams', this.time, this.type, this.station);
      }

    },
    'top'() {
      this.station = {};
      this.$broadcast('receiveParams', this.time, this.type, this.station);
    }
  }
}
</script>