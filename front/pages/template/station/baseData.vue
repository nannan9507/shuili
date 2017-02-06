<template>
<div class="base-data">
<table class="table-form">
  <tr>
    <td class="title">名称</td>
    <td><input type="text" v-model="station.name" /></td>
  </tr>
  <tr>
    <td class="title">站点编码</td>
    <td>{{ station.station_code }}</td>
  </tr>
  <tr>
    <td class="title">站点密码</td>
    <td><input type="text" v-model="station.password" /></td>
  </tr>
  <tr>
    <td class="title">经纬度</td>
    <td  id="special">
      <input type="text" v-model="station.coordinate" /><!-- <span>地图拾取</span> -->
      <p>坐标形式，以逗号隔开</p>
    </td>
  </tr>
  <tr>
    <td class="title">行政区划</td>
    <td>
      <Ztree :list="nodes" name="basedata" type="select"></Ztree>
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
    <td><input type="text" v-model="station.teamviewer" /></td>
  </tr>
  <tr>
    <td class="title">介绍</td>
    <td><textarea cols="60" rows="4" resize="none" v-model="station.description"></textarea></td>
  </tr>
  <tr>
    <td class="title"></td>
    <td>
      <Button class="button-base" text="保存" @click="update"></Button>
    </td>
  </tr>
</table>
</div>
</template>

<script>
import VueFileUpload from 'vue-file-upload'
import Button from '../../../components/Button'
import Ztree from '../../../components/Ztree.vue'
import { requestHandler } from '../../../services/index.js'

export default {
  components: {
    Button,
    Ztree,
    VueFileUpload
  },
  data() {
    return {
      station: {},
      nodes: [],
      station_image: '',
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
            this.$dispatch('Warning:dispatch', '上传成功', 'success')
            this.uploadBtn = {
              text: '成功',
              isDisabled: true
            }
          } else {
            this.$dispatch('Warning:dispatch', '上传失败', 'fail');
          }
        },
        onAddFileSuccess: (file) => {}
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
    update() {
      requestHandler('updateStation', {
        data: {
          id: this.station.id,
          name: this.station.name,
          org_id: this.station.org_id,
          password: this.station.password,
          coordinate: this.station.coordinate,
          description: this.station.description,
          image: this.station_image,
          teamviewer: this.station.teamviewer
        }
      }, (res) => {
        if (res.body.success) {
          this.$dispatch('Warning:dispatch', '更新成功', 'success');
          this.$dispatch('changeName', this.station);
        } else {
          this.$dispatch('Warning:dispatch', res.body.message, 'fail');
        }
      })
    }
  },
  events: {
    getStation(station) {
      this.station = station;

      // org_id
      const resource = this.$resource('/apis/station/tree/orgs');
      resource.get({}).then(function (cb) {
        this.nodes = cb.body.data;
        this.$broadcast('createZtree', cb.body.data);
        this.$nextTick(() => {
          this.$broadcast('setInputValue', this.station);
        })
      })
    },
    getOrgId(id) {
      this.station.org_id = id;
    },
    getNewStation(name) {
      this.station.org_name = name;
    }
  }
}
</script>