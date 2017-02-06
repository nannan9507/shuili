<template>
  <div class="container single homepage">
    <div class="container-box">

      <div class="status-box" v-show="mode.table">
        <h3>站点状态</h3>
        <div class="content">
          <section>
            <div class="intro">站点联网率</div>
            <div>
              <span class="val">{{ data.idleRate }}</span>
              <span class="unit">%</span>
            </div>
          </section>
          <section>
            <div class="intro">
              已连接站点
            </div>
            <div>
              <span class="val">{{ data.connectionCount }}</span>
              <span class="unit">个</span>
            </div>
          </section>
          <section>
            <div class="intro">
              未连接站点
            </div>
            <div>
              <span class="val">{{ data.idleCount }}</span>
              <span class="unit">个</span>
            </div>
          </section>
        </div>
      </div>

      <div class="explain" v-show="mode.table">
        说明： '/'表示站点无该因子数据，'-'表示因子目前数据为空
      </div>

      <div class="line my">
        <h3>
          <b style="float: left;">最新检测数据</b>
          <select type="text" style="float: left; margin-top: -10px; margin-left: 30px;" v-model="city" @change="checkNewData()" v-show="mode.table">
            <option value="0" selected>全部站点</option>
            <option value="{{ item.id }}" v-for="item in cityList">{{ item.name }}</option>
          </select>
          <span @click="changeMode" v-show="mode.show">切换{{ mode.text }}模式</span>
          <span @click="changeMode" v-show="!mode.show">地图加载中...</span>
        </h3>
        <div class="content" style="margin-top: 5px;">
          <label class="audio"><input type="checkbox" @click="soundToggle" /><b>声音提醒</b></label>
          <label class="refresh"><input type="checkbox" @click="timerToggle(timer.status)" /><span>{{ timer.current || timer.clark }}</span><b>秒后刷新</b></label>
          <span class="iconfont refresh-icon icon-refresh" @click="freshBtn"></span>
        </div>
      </div>


      <audio id="audio">
        <source :src="soundSrc" type="audio/wav">
        Your browser does not support the audio tag.
      </audio>

      <simulate-table v-show="mode.table"></simulate-table>

      <Map name="index" v-show="mode.map"></Map>

    </div>
  </div>
</template>

<script>
import soundSrc from '../images/song.wav'
import SimulateTable from '../components/SimulateTable'
import Map from '../components/Map'
import { getBarList } from '../vuex/actions'
import { requestHandler } from '../services/index.js'

export default {
  vuex: {
    actions: {
      getBarList
    }
  },
  components: {
    SimulateTable,
    Map,
  },
  data() {
    return {
      data: {
        connectionCount: 0,
        idleCount: 0,
        idelRate: 0
      },
      cityList: [],
      city: {},
      table: {},
      sound: false,
      time: false,
      timer: {
        status: 'open',
        tick: {},
        clark: 60,
        current: ''
      },
      mode: {
        show: true,
        text: '地图',
        table: true,
        map: false
      },
      mapOptions: {},
      soundSrc: soundSrc
    }
  },
  ready() {
    requestHandler('getCity', {}, (res) => {
      if (res.body.data && res.body.data.length > 0) {
        this.cityList = res.body.data || [];
      }
    })

    // this.$resource('/apis/data/city').get({}).then((res) => {
    //   this.cityList = res.body.data || [];
    // })

    // const resource = this.$resource('/apis/station/home/setting')

    // resource.get({}).then((res) => {
    //   if (res.body.data && res.body.data.sys_name) {
    //     document.title = res.body.data.sys_name;
    //     localStorage.setItem('sys_name', res.body.data.sys_name);
    //   }

    //   if (res.body.data &&res.body.data.company_name) {
    //     localStorage.setItem('company_name', res.body.data.company_name);
    //   }
    // })
  },
  methods: {
    changeMode() {
      if (this.mode.text === '地图') {
        this.mode.text = '列表';
        this.mode.show = false;
        const mapInfo = JSON.parse(localStorage.getItem('settings')).map_org;
        this.$broadcast('mapCalled', mapInfo, this.table.stations, 'big', true);
      } else if (this.mode.text === '列表') {
        this.mode.text = '地图';
      }

      this.mode.table = !this.mode.table;
      this.mode.map = !this.mode.map;
    },
    checkNewData(freshBtn) {
      const resource = this.$resource('/apis/data/latest');

      resource.get({
        d: localStorage.getItem('d') || null,
        org: parseInt(this.city) || null
      }).then(function (res) {
        if (res.body.success) {

          if (freshBtn) {
            if (res.body.data.hasChanged) {
              this.soundPlay();
            }
          } else {
            if (res.body.data.hasChanged) {
              this.$dispatch('Warning:dispatch', '刷新成功', 'success');
            } else {
              this.$dispatch('Warning:dispatch', '暂无新数据', 'success');
            }
          }

          if (res.body.data.hasChanged) {
            localStorage.setItem('d', res.body.data.d_value);
            this.data = res.body.data.stationIdleRate;
            this.table.thead = res.body.data.thead;
            this.table.stations = res.body.data.stations;

            this.$broadcast('simulateMulti', this.table);
          }
        }
      })
    },
    getData() {
      const resource = this.$resource('/apis/data/latest');

      resource.get().then((res) => {
        if (res.body.success) {
          localStorage.setItem('d', res.body.data.d_value);
          this.data = res.body.data.stationIdleRate;
          this.table.thead = res.body.data.thead;
          this.table.stations = res.body.data.stations;
          this.$nextTick(() => {
            this.$broadcast('simulateMulti', this.table);
          })
        }
      })
    },
    soundToggle() {
      this.sound = !this.sound;
      localStorage.setItem('sound', this.sound);
    },
    soundPlay() {
      if (this.sound) {
        const audio = document.getElementById('audio');
        audio.play();
      } else {
        audio.pause();
        audio.currentTime = 0.0;
      }
    },
    updateTimer() {
      if (this.timer.current <= 1) {
        // 刷新时间
        this.timer.current = this.timer.clark;
        // 获取数据
        this.checkNewData('auto');
      } else {
        this.timer.current--;
      }
    },
    timerToggle(status) {
      if (status === 'open') {
        this.time = true;
        this.timer.current = this.timer.clark;
        this.timer.status = 'close';
        this.timer.tick = setInterval(() => {
          this.updateTimer();
        }, 1000);
      } else if (status === 'close') {
        this.time = false;
        clearInterval(this.timer.tick);

        this.timer = {
          status: 'open',
          tick: {},
          clark: 60,
          current: '',
        }
      }
    },
    freshBtn() {
      clearInterval(this.timer.tick);

      // 获取data
      this.checkNewData();

      this.timer = {
        status: 'open',
        tick: {},
        clark: 60,
        current: '',
      }

      if (this.time) {
        this.timerToggle(this.timer.status);
      }
    }
  },
  events: {
    'showMode'() {
      this.mode.show = true;
    }
  },
  route: {
    activate() {
      // 获取active
      this.$dispatch('reSendChangeActive');

      // window.location.reload();
      this.getData();

      // document.title = localStorage.getItem('sys_name') || '管理平台';
      document.title = '实时监控';
    }
  }
}
</script>