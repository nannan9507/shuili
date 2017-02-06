<template>
<div class="station-box" v-show="!edit && !add">
  <header class="lonely">
    <h2>站点</h2>
  </header>
  <div class="line">
    <!-- <input type="text" placeholder="湖南省--下拉框" /> -->
    <Button class="btn button-setting" style="margin-left: 0;" text="添加站点" @click="openStationPage"></Button>
  </div>

  <table class="table-header">
    <thead>
      <th>站点</th>
      <th>行政区划</th>
      <th>站点编码</th>
      <th>经纬度</th>
      <th>操作</th>
    </thead>
    <tbody>
      <tr v-for="item in stations">
        <td><span class="btn" @click="editStation(item)">{{ item.name }}</span></td>
        <td>{{ item.org_name }}</td>
        <td>{{ item.station_code }}</td>
        <td>{{ item.coordinate }}</td>
        <td><span class="btn" @click="del(item, $index)">删除</span></td>
      </tr>
    </tbody>
  </table>
</div>

<div class="station-edit-box" v-show="edit">
  <header>
    <label @click="back">&lt;返回</label>
    <h2>编辑{{ station_name }}</h2>
    <nav-select></nav-select>
  </header>

  <base-data v-show="type_selector === '基本资料'"></base-data>
  <factor-setting v-show="type_selector === '因子配置'"></factor-setting>
  <factor-stategy v-show="type_selector === '告警策略'"></factor-stategy>
</div>


<div class="station-edit-box" v-show="add">
  <add-station></add-station>
</div>

</template>

<script>
import Vue from 'vue'

import NavSelect from '../../components/NavSelect'
import Button from '../../components/Button'
import { requestHandler } from '../../services/index.js'

import baseData from './station/baseData'
import factorSetting from './station/factorSetting'
import factorStategy from './station/factorStategy'
import addStation from './station/addStation'


export default {
  components: {
    NavSelect,
    Button,
    baseData,
    factorSetting,
    factorStategy,
    addStation
  },
  data() {
    return {
      station_name: '',
      edit: false,
      add: false,
      stations: [],
      station: {},
      type_selector: ''
    }
  },
  ready() {
    requestHandler('getStations', {}, (cb) => {
      if (cb.body.data && cb.body.data.length > 0) {
        this.stations = cb.body.data;
      }
    })
  },
  methods: {
    openStationPage() {
      this.add = true;
      this.$broadcast('resetStation');
    },
    editStation(item) {
      this.station_name = item.name;

      // Promise
      const getDatas = (ready) => {
        return new Promise((resolve, reject) => {
          resolve();
        })
      }

      getDatas().then(() => {
        const resource2 = this.$resource('/apis/station{/id}');
        return resource2.get({
          id: item.id
        }).then(function (cb) {
          this.$broadcast('getStation', cb.body.data);
        })
      }).then(() => {
        const resource = this.$resource('/apis/station/factor{/id}');
        return resource.get({
          id: item.id
        }).then(function (cb) {
          if (cb.body.data.length > 0) {
            this.$broadcast('getStationFactor', item.id, cb.body.data);
          }
        })
      }).then(() => {
        const resource = this.$resource('/apis/station/alarm{/id}');

        return resource.get({
          id: item.id
        }).then(function (cb) {
          if (cb.body.data.length > 0) {
            this.$broadcast('getStationAlarm', item.id, cb.body.data);
          }
        })
      }).then(() => {
        this.edit = true;
      })
    },
    del(item, index) {
      const confirm = window.confirm('确认删除 '+item.name+' ?');
      if (confirm) {
        const resource = this.$resource('/apis/station{/id}');

        resource.delete({
          id: item.id
        }).then(function (cb) {
          if (cb.body.success) {
            this.stations.splice(index, 1);
          }
        })
      }
    },
    back() {
      this.$router.go('/setting/station');
      this.edit = false;
    }
  },
  events: {
    type(name) {
      this.type_selector = name;
    },
    back() {
      this.add = false;
      requestHandler('getStations', {}, (cb) => {
        if (cb.body.data && cb.body.data.length > 0) {
          this.stations = cb.body.data;
        }
      })
    },
    changeName(station) {
      for (let i = 0; i < this.stations.length; i++) {
        if (station.id === this.stations[i].id) {
          this.stations.splice(i, 1, station);
        }
      }
    }
  }
}
</script>