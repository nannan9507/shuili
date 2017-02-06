<style>
  body.week .datepicker-days tbody tr:hover td {
    background: #eee;
  }
</style>

<template>
<div class="history-records">

  <div class="line">
    <label>
      <input type="radio" name="type" checked="checked" @click="choiceDate('day')"/>
      <span>日</span>
    </label>
    <label>
      <input type="radio" name="type" @click="choiceDate('week')"/>
      <span>周</span>
    </label>
    <label>
      <input type="radio" name="type" @click="choiceDate('month')"/>
      <span>月</span>
    </label>
    <label>
      <input type="radio" name="type" @click="choiceDate('year')"/>
      <span>年</span>
    </label>
    <label>
      <input type="radio" name="type" @click="choiceDate('custom')"/>
      <span>自定义</span>
    </label>
    <label>
      <button class="button-setting" style="float:right;" @click="exportFile">导出报表</button>
    </label>
  </div>

  <div class="timePicker">
    <input class="time-input" id="day" type="text" v-show="timePicker === 'day'" readonly />
    <input class="time-input" id="week" type="text" v-show="timePicker === 'week'" readonly />
    <input class="time-input" id="month" type="text" v-show="timePicker === 'month'" readonly />
    <input class="time-input" id="year" type="text" v-show="timePicker === 'year'" readonly />
    <div class="input-daterange" data-provide="datepicker" v-show="timePicker === 'custom'">
      <input type="text" class="time-input time1" id="time1" style="border: 1px solid #ccc; text-align: left;" readonly>
      <span style="color: #666;">-</span>
      <input type="text" class="time-input time2" id="time2" style="border: 1px solid #ccc; text-align: left;" readonly>
    </div>
  </div>

  <simulate-table style="margin-top: 30px;"></simulate-table>
</div>
</template>

<script>
import '../../styles/jquery.datetimepicker.css'
import '../../styles/bootstrap-datepicker.standalone.css'
import $ from 'jquery'
import '../../services/bootstrap-datepicker.min.js'
import '../../services/bootstrap-datepicker.zh-CN.min.js'
import SimulateTable from '../../components/SimulateTable.vue'
import moment from 'moment'

export default {
  components: {
    SimulateTable
  },
  data() {
    return {
      timePicker: 'day',
      time: {
        start: moment().startOf('day').format('YYYY/MM/DD'),
        end: moment().endOf('day').format('YYYY/MM/DD')
      },
      station: {}
    }
  },
  ready() {
    this.choiceDate('day');
  },
  watch: {
    'station'(n, o) {
      this.choiceDate('day');
    }
  },
  methods: {
    exportFile() {
      let type;
      if (this.timePicker === 'day') {
        type = 'hour';
      } else if (this.timePicker === 'month' || this.timePicker === 'custom' || this.timePicker === 'week') {
        type = 'month';
      } else if (this.timePicker === 'year') {
        type = 'year';
      }

      const resource = this.$resource('/apis/data/stations{/id}/export');
      if (JSON.parse(sessionStorage.getItem('station')) && JSON.parse(sessionStorage.getItem('station')).id) {
        resource.get({
          id: JSON.parse(sessionStorage.getItem('station')).id,
          start: this.time.start,
          end: this.time.end,
          type: type,
          headers: {
            token: localStorage.getItem('token')
          }
        }).then((res) => {
          if (res.body.url) {
            window.open(res.body.url)
          }
        })
      }
      
    },
    getData(start, end, type) {
      let resource;

      if (type === 1) {
        resource = this.$resource('/apis/data/stations{/id}/day');
      } else if (type === 2) {
        resource = this.$resource('/apis/data/stations{/id}');
      } else if (type === 3) {
        resource = this.$resource('/apis/data/stations{/id}/year');
      }

      if (JSON.parse(sessionStorage.getItem('station')) && JSON.parse(sessionStorage.getItem('station')).id) {
        resource.get({
          id: JSON.parse(sessionStorage.getItem('station')).id,
          start: start,
          end: end
        }).then((res) => {
          if (res.body.success) {
            this.$broadcast('SimulateTimeline', res.body.data, type);
          }
        })
      }
    },
    choiceDate(time) {
      this.$broadcast('clear');
      this.timePicker = time;
      switch (time) {
        case 'day':
          $("body").removeClass("week");

          $('#day').val(moment().startOf('day').format('YYYY-MM-DD'));
          this.time.start = moment().startOf('day').format('YYYY/MM/DD');
          this.time.end = moment().endOf('day').format('YYYY/MM/DD');
          this.getData(this.time.start, this.time.end, 1);

          $('#day').datepicker({
            format: 'yyyy-mm-dd',
            weekStart: 1,
            language: "zh-CN",
            autoclose: true,
            todayHighlight: true,
            startView: 'day',
            maxViewMode: 'decade',
          }).on('changeDate', (e) => {
            this.$broadcast('clear');
            this.time.start = moment(e.date).startOf('day').format('YYYY/MM/DD');
            this.time.end = moment(e.date).endOf('day').format('YYYY/MM/DD');

            this.getData(this.time.start, this.time.end, 1);
          })
          break;
        case 'week':
          $("body").addClass("week");

          $('#week').val(`${moment().get('year')}-${moment().isoWeek()}周`);
          this.time.start = moment().startOf('isoWeek').format('YYYY/MM/DD');
          this.time.end = moment().endOf('isoWeek').format('YYYY/MM/DD');
          this.getData(this.time.start, this.time.end, 2)

          this.$nextTick(() => {
            $('#week').datepicker({
              weekStart: 1,
              language: "zh-CN",
              autoclose: true,
              todayHighlight: true,
              calendarWeeks: true,
              forceParse: false,
              maxViewMode: 'decade'
            }).on('changeDate', (e) => {
              this.$broadcast('clear');
              // 获取数据
              this.time.start = moment(e.date).startOf('isoWeek').format('YYYY/MM/DD');
              this.time.end = moment(e.date).endOf('isoWeek').format('YYYY/MM/DD');
              
              // 改变样式
              $('#week').val(`${moment(e.data).get('year')}-${moment(e.date).isoWeek()}周`);

              $('.week td.active').parent().children('.cw').addClass('active')
              $('.week td.day.active').removeClass('active')

              this.getData(this.time.start, this.time.end, 2);
            })
          })
          break;
        case 'month':
          $("body").removeClass("week");

          $('#month').val(moment().startOf('month').format('YYYY-MM'));
          this.time.start = moment().startOf('month').format('YYYY/MM/DD');
          this.time.end = moment().endOf('month').format('YYYY/MM/DD');
          this.getData(this.time.start, this.time.end, 2)

          $("#month").datepicker({
            format: 'yyyy-mm',
            weekStart: 1,
            language: "zh-CN",
            autoclose: true,
            todayHighlight: true,
            startView: 'year',
            maxViewMode: 'decade',
            minViewMode: 'year'
          }).on('changeDate', (e) => {
            this.$broadcast('clear');
            this.time.start = moment(e.date).startOf('month').format('YYYY/MM/DD');
            this.time.end = moment(e.date).endOf('month').format('YYYY/MM/DD');

            this.getData(this.time.start, this.time.end, 2);
          })
          break;
        case 'year':
          $("body").removeClass("week");

          $('#year').val(moment().startOf('year').format('YYYY'));
          this.time.start = moment().startOf('year').format('YYYY/MM/DD');
          this.time.end = moment().endOf('year').format('YYYY/MM/DD');
          this.getData(this.time.start, this.time.end, 3)

          $('#year').datepicker({
            format: "yyyy",
            weekStart: 1,
            language: "zh-CN",
            autoclose: true,
            todayHighlight: true,
            startView: 'decade',
            maxViewMode: 'decade',
            minViewMode: 'decade'
          }).on('changeDate', (e) => {
            this.$broadcast('clear');
            this.time.start = moment(e.date).startOf('year').format('YYYY/MM/DD');
            this.time.end = moment(e.date).endOf('year').format('YYYY/MM/DD');

            this.getData(this.time.start, this.time.end, 3);
          })
          break;
        case 'custom':
          $("body").removeClass("week");

          $('#time1').val(moment().subtract(7, 'days').format('YYYY-MM-DD'));
          $('#time2').val(moment().startOf('custom').format('YYYY-MM-DD'));
          this.time.start = moment().subtract(7, 'days').startOf('day').format('YYYY/MM/DD')
          this.time.end = moment().endOf('day').format('YYYY/MM/DD');
          this.getData(this.time.start, this.time.end, 2)

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
              that.$broadcast('clear');
              if ($(e.target)[0].className === 'time-input time1') {
                that.time.start = moment(e.date).startOf('day').format('YYYY/MM/DD');
              } else if ($(e.target)[0].className === 'time-input time2') {
                that.time.end = moment(e.date).endOf('day').format('YYYY/MM/DD');
              }

              if (that.time.start && that.time.end) {
                that.getData(that.time.start, that.time.end, 2);
              }
            })
          })
          break;
      }
    }
  },
  events: {
    'getParentStation'(station) {
      this.station = station;
    }
  }
}
</script>