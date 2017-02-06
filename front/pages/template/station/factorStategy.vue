<template>
<div class="factor-stategy">
  <table class="table-header">
    <thead>
      <th>告警策略</th>
      <th>策略类型</th>
      <th>触发条件</th>
      <th>应用</th>
    </thead>
    <tbody>
      <tr v-for="item in list">
        <td>{{ item.name }}</td>
        <td>{{ item.type === 1 ? '阈值告警' : '关联告警' }}</td>
        <td>{{ item.conditions_string.length > numberLimit ? item.conditions_string.substring(0, numberLimit-3)+'...' : item.conditions_string }}</td>
        <td>
          <span class="btn special" @click="settingA(item)" v-text="item.selected ? '是' : '否' "></span>
        </td>
      </tr>
    </tbody>
  </table>
  <Button class="button-setting-big" style="margin-top: 30px;" text="保存配置" @click="saveAlarm()"></Button>
</div>
</template>

<script>
import Button from '../../../components/Button'
import { requestHandler } from '../../../services/index.js'

export default {
  components: {
    Button
  },
  data() {
    return {
      station_id: '',
      list: [],
      update_alarms: []
    }
  },
  methods: {
    settingA(item) {
      // init
      this.update_alarms = [];
      for (let i = 0; i < this.list.length; i++) {
        if (this.list[i].selected) {
          this.update_alarms.push(this.list[i].id);
        }
      }

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
          id: this.station_id,
          alarm_policies: this.update_alarms
        }
      }, (res) => {
        if (res.body.success) {
          this.$dispatch('Warning:dispatch', '修改成功', 'success');
        } else {
          this.$dispatch('Warning:dispatch', res.body.message, 'fail');
        }
      })
    }
  },
  events: {
    getStationAlarm(station_id, list) {
      this.station_id = station_id;
      this.list = list;
    }
  }
}
</script>