<template>
<div class="station-data">
  <div class="station-pic-box">
    <!-- map -->
    <div class="station-pic">
      <div id="container" style="margin: 0 auto;width: 100%;height: 100%;"></div>
    </div>
    <img :src="image" v-show="image" />
  </div>
  <div class="station-introduce">
    <div class="line">
      <div class="title">测站编码：</div>
      <div class="content">{{ station.station_code }}</div>
    </div>
    <div class="line">
      <div class="title">行政区划：</div>
      <div class="content">{{ station.org_name }}</div>
    </div>
    <div class="line">
      <div class="title">站点坐标：</div>
      <div class="content">{{ station.coordinate }}</div>
    </div>
    <div class="line">
      <div class="title">teamviewer：</div>
      <div class="content">{{ station.teamviewer }}</div>
    </div>
<!--     <div class="line">
      <div class="title">站址：</div>
      <div class="content"><span>常德市北京路188号</span></div>
    </div> -->
    <div class="line">
      <div class="title">测站描述：</div>
      <div class="content longtext">{{ station.description }}</div>
    </div>
  </div>
</div>
</template>

<script>
import Vue from 'vue'
import { requestHandler } from '../../services/index.js'
import bling from '../../images/bling.gif'
// import server from '../../../server/configs/server.js'

export default {
  components: {
    Map
  },
  data() {
    return {
      station: {},
      map: {},
      image: ''
    }
  },
  ready() {
    this.getStation();
  },
  methods: {
    getStation() {
      const resource = this.$resource('/apis/station/stations{/id}');
      if (sessionStorage.getItem('station')) {
        return resource.get({
          id: JSON.parse(sessionStorage.getItem('station')).id
        }).then(function (cb) {
          if (cb.body.success) {
            this.station = cb.body.data;
            const mapInfo = JSON.parse(localStorage.getItem('settings')).map_org;
            this.setMap(mapInfo, cb.body.data);
          }
        })
      }
    },
    setMap(options, obj) {
      const server = window.location.origin;
      if (obj.image) {
        this.image = `${server}/api/image/${obj.image}`
      } else {
        this.image = ''
      }
      // if (obj.image) {
      //   this.image = `${server.apiUrl.url}:${server.apiUrl.port}/api/image/${obj.image}`
      // } else {
      //   this.image = ''
      // }

      let coordinate = obj.coordinate.split(',');

      if (coordinate.length > 0) {   
        for (let i = 0; i < coordinate.length; i++) {
          coordinate[i] = parseFloat(coordinate[i]);
        }

        const map = new AMap.Map('container', {
          view : new AMap.View2D({
            center: [coordinate[0], coordinate[1]],
            zoom: parseInt(options.level_type) + 6
          }),
          features : ['bg', 'point']
        });

        let icon = new AMap.Icon({
          size: new AMap.Size(32, 32),
          image: bling
        });


        new AMap.Marker({
          map: map,
          position: [coordinate[0], coordinate[1]],
          icon: bling
        });
      }

    }
  },
  events: {
    'getParentStation'(station) {
      this.station = station;
      this.getStation(station);
    }
  }
}
</script>