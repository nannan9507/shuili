<template>
<div class="user-add">
  <header>
    <label @click="toUpPage"><i class="iconfont icon-iconback"></i>返回</label>
    <h2>新增站点</h2>
  </header>

  <div class="type-box">
    <div class="button-box">
      <div class="circle-box" :class="{ 'active': stage['1'].pass === 'now', 'done': stage['1'].finish }">
        <div class="circle"></div>
        基本资料
      </div>
    </div>
    <div class="button-box">
      <div class="circle-box" :class="{ 'active': stage['2'].pass === 'now', 'done': stage['2'].finish }">
        <div class="circle"></div>
        配置因子
      </div>
    </div>
    <div class="button-box">
      <div class="circle-box" :class="{ 'active': stage['3'].pass === 'now', 'done': stage['3'].finish }">
        <div class="circle"></div>
        配置告警策略
      </div>
    </div>
  </div>

  <div class="stage" v-show="stage.step === 1">  
    <div class="base-data">
      <table class="table-form">
        <tr>
          <td class="title"><span style="color: red;">*</span>名称</td>
          <td><input type="text" v-model="name" /></td>
        </tr>
        <tr>
          <td class="title"><span style="color: red;">*</span>编码</td>
          <td><input type="text" v-model="station_code" /></td>
        </tr>
        <tr>
          <td class="title"><span style="color: red;">*</span>站点密码</td>
          <td><input type="text" v-model="password" /></td>
        </tr>
        <tr>
          <td class="title"><span style="color: red;">*</span>经纬度</td>
          <td id="special">
            <input type="text" v-model="coordinate" /><!-- <span>地图拾取</span> -->
            <p>坐标形式，以逗号隔开</p>
          </td>
        </tr>
        <tr>
          <td class="title"><span style="color: red;">*</span>行政区划</td>
          <td>
            <Ztree name="city" type="select"></Ztree>
          </td>
        </tr>
        <tr>
          <td class="title">站点图片</td>
          <td>
            <vue-file-upload url="/apis/data/image" :files.sync="files" :events="cbEvents" :filters="filters" :request-options="reqopts" ></vue-file-upload>
            <div style="margin-top: 5px;" v-for="file in files" v-if="$index === files.length-1" >{{ file.name }} <Button class="button-setting" :text="'上传'" @click="uploadItem(file)" v-show="!file.isDisabled"></Button></div>
          </td>
        </tr>
        <tr>
          <td class="title">teamviewer</td>
          <td><input type="text" v-model="teamviewer" /></td>
        </tr>
        <tr>
          <td class="title">介绍</td>
          <td><textarea cols="60" rows="4" resize="none" v-model="description"></textarea></td>
        </tr>
        <tr>
          <td class="title"></td>
          <td>
            <Button class="button-base" text="保存" @click="signup('next')"></Button>
          </td>
        </tr>
      </table>
    </div>
  </div>

  <div class="stage" v-show="stage.step === 2">
    <table class="table-header">
      <thead>
        <th>因子名称</th>
        <th>单位</th>
        <th>应用</th>
      </thead>
      <tbody>
        <tr v-for="i in factors">
          <td>{{ i.name }}</td>
          <td>{{ i.m_unit }}</td>
          <td>
            <span class="btn special" @click="setting(i)" v-text="i.selected ? '是' : '否' "></span>
          </td>
        </tr>
      </tbody>
    </table>
    <Button class="button-setting-big" style="margin-top: 30px;" text="保存配置" @click="saveSetting('next')"></Button>
  </div>

  <div class="stage" v-show="stage.step === 3">
    <table class="table-header">
      <thead>
        <th>告警策略</th>
        <th>策略类型</th>
        <th>触发条件</th>
        <th>应用</th>
      </thead>
      <tbody>
        <tr v-for="item in alarms">
          <td>{{ item.name }}</td>
          <td>{{ item.type === 1 ? '阈值告警' : '关联告警' }}</td>
          <td>{{ item.conditions_string.length > numberLimit ? item.conditions_string.substring(0, numberLimit-3)+'...' : item.conditions_string }}</td>
          <td>
            <span class="btn" v-text="item.selected ? '是' : '否'" @click="settingAlarm(item)"></span>
          </td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 30px;">
      <Button class="button-setting-big" text="上一步" @click="back"></Button>
      <Button class="button-setting-big" text="完成" @click="saveAlarm"></Button>
    </div>
  </div>
</div>
</template>

<script>
import VueFileUpload from 'vue-file-upload'

import Button from '../../../components/Button'
import { requestHandler } from '../../../services/index.js'
import Ztree from '../../../components/Ztree.vue'

export default {
  data() {
    return {
      name: '',
      station_code: '',
      password: '',
      coordinate: '',
      description: '',
      teamviewer: '',
      newStation_id: '',
      stations: [],
      factors: [],
      org_id: '',
      update_factors: [],
      stations_conf: [],
      alarms: [],
      update_alarms: [],
      numberLimit: 40,
      station_image: '',
      stage: {
        step: 1,
        1: {
          pass: 'now',
          finish: false
        },
        2: {
          pass: '',
          finish: false
        },
        3: {
          pass: '',
          finish: false
        }
      },
      files: [],
      filters: [
        {
          name: "imageFilter",
          fn(file) {
            var type = '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|'.indexOf(type) !== -1;
          }
        }
      ],
      cbEvents: {
        onCompleteUpload: (file,response,status,header) => {
          const res = JSON.parse(response);
          if (res.success) {
            this.station_image = res.data;
            this.$dispatch('Warning:dispatch', '上传成功', 'success');
          } else {
            this.$dispatch('Warning:dispatch', '上传失败', 'fail');
          }
        },
      },
      reqopts: {
        formData:{},
        headers: {
          token: localStorage.getItem('token')
        },
        responseType: '',
        withCredentials: false
      }
    }
  },
  components: {
    Button,
    Ztree,
    VueFileUpload
  },
  methods: {
    uploadItem(file) {
      file.upload();
    },
    onStatus(file){
      if(file.isSuccess){
        return "上传成功";
      }else if(file.isError){
        return "上传失败";
      }else if(file.isUploading){
        return "正在上传";
      }else{
        return "待上传";
      }
    },
    signup(next) {
      let index = this.coordinate.indexOf('，');

      if (index > -1) {
        this.coordinate.substring(index, 1, ',');
      }


      requestHandler('addStation', {
        data: {
          name: this.name,
          org_id: this.org_id,
          station_code: this.station_code,
          password: this.password,
          coordinate: this.coordinate,
          description: this.description,
          image: this.station_image,
          teamviewer: this.teamviewer
        }
      }, (res) => {
        if (res.body.success) {
          this.newStation_id = res.body.data.id;
          this.$dispatch('Warning:dispatch', '创建成功', 'success');
          if (next === 'next') {
            this.next();
          }
        } else {
          this.$dispatch('Warning:dispatch', res.body.message, 'fail');
        }

      })
    },
    next() {
      const past_step = '' + this.stage.step;
      this.stage[past_step].finish = true;

      const now_step = '' + ++this.stage.step;

      this.stage[now_step].pass = 'now';

      if (this.stage.step === 2) {
        this.secondAction();
      }

      if (this.stage.step === 3) {
        this.thirdAction();
      }
    },
    secondAction() {
      this.factors = [];
      const resource = this.$resource('/apis/station/factor{/id}');
      return resource.get({
        id: this.newStation_id
      }).then(function (cb) {
        if (cb.body.data && cb.body.data.length > 0) {
          this.factors = cb.body.data;
        }
      })
    },
    thirdAction() {
      this.alarms = [];
      const resource = this.$resource('/apis/station/alarm{/id}');
      return resource.get({
        id: this.newStation_id
      }).then(function (cb) {
        if (cb.body.data && cb.body.data.length > 0) {
          this.alarms = cb.body.data;
        }
      })
    },
    back() {
      const past_step = '' + this.stage.step;
      this.stage[past_step].pass = '';

      const now_step = '' + --this.stage.step;

      this.stage[now_step].finish = false;
    },
    toUpPage() {
      this.$dispatch('back');
    },
    setting(item) {
      let flag = {
        status: item.selected,
        index: null
      }

      item.selected = !item.selected;

      for (let i = 0; i < this.update_factors.length; i++) {
        if (this.update_factors[i] === item.id) {
          flag.index = i;
        }
      }

      // 存在则删除
      if (flag.status) {
        this.update_factors.splice(flag.index, 1);
      } else {
        this.update_factors.push(item.id);
      }
    },
    saveSetting(next) {
      requestHandler('updateStationFactor', {
        data: {
          id: this.newStation_id,
          factors: this.update_factors
        }
      }, (res) => {
        if (res.body.success === false) {
          this.$dispatch('Warning:dispatch', res.body.message, 'fail')
        } else {
          this.$dispatch('Warning:dispatch', '因子配置成功', 'success')
          if (next === 'next') {
            this.next();
          }
        }
      })
    },
    settingAlarm(item) {
      let flag = {
        status: item.selected,
        index: null
      }

      item.selected = !item.selected;

      for (let i = 0; i < this.update_alarms.length; i++) {
        if (this.update_alarms[i] === item.id) {
          flag.index = i;
        }
      }

      // 存在则删除
      if (flag.status) {
        this.update_alarms.splice(flag.index, 1);
      } else {
        this.update_alarms.push(item.id);
      }
    },
    saveAlarm() {
      requestHandler('updateStationAlarm', {
        data: {
          id: this.newStation_id,
          alarm_policies: this.update_alarms
        }
      }, (res) => {
        if (res.body.success) {
          this.$dispatch('Warning:dispatch', '创建成功', 'success');
          this.toUpPage();
        } else {
          this.$dispatch('Warning:dispatch', res.body.message, 'success');
        }
      })
    },
    // upload
  },
  events: {
    getOrgId(id) {
      this.org_id = id;
    },
    getStationFactor(station_id, list) {
      this.list = [];
      this.factors = [];
      this.station_id = '';

      this.station_id = station_id;
      for (let i = 0; i < list.length; i++) {
        this.list.push(list[i]);
        if (list[i].selected === true) {
          this.update_factors.push(list[i].id);
        }
      }

    },
    resetStation() {
      this.name = '';
      this.station_code = '';
      this.password = '';
      this.coordinate = '';
      this.description = '';
      this.newStation_id = '';
      this.stations = [];
      this.factors = [];
      this.files = [];
      this.org_id = '';
      this.update_factors = [];
      this.stations_conf = [];
      this.alarms = [];
      this.update_alarms = [];
      this.station_image = '';
      this.stage = {
        step: 1,
        1: {
          pass: 'now',
          finish: false
        },
        2: {
          pass: '',
          finish: false
        },
        3: {
          pass: '',
          finish: false
        }
      }

      const resource = this.$resource('/apis/station/tree/orgs');
      resource.get({}).then(function (cb) {
        if (cb.body.data && cb.body.data.length > 0) {
          this.$broadcast('createZtree', cb.body.data);
        }
      })
    }
  }
}
</script>