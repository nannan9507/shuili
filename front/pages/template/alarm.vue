<template>
<div class="alarm-box" v-show="!new_alarm && !edit_alarm">
  <header class="lonely">
    <h2>告警策略</h2>
  </header>
  <div class="line">
    <Button class="button-setting" text="新建策略" @click="add"></Button>
  </div>

  <table class="table-header">
    <thead>
      <th>名称</th>
      <th>触发条件</th>
      <th>策略类型</th>
    </thead>
    <tbody>
      <tr v-for="item in list">
        <td><span @click="edit(item)">{{ item.name }}</span></td>
        <td>
          {{ item.conditions_string.length > numberLimit ? item.conditions_string.substring(0, numberLimit-3)+'...' : item.conditions_string }}
        </td>
        <td>{{ item.type === 1 ? '阈值告警' : '关联告警' }}</td>
      </tr>
    </tbody>
  </table>
</div>

<new-alarm v-show="new_alarm"></new-alarm>
<edit-alarm v-show="edit_alarm"></edit-alarm>
</template>

<script>
import Button from '../../components/Button'
import { requestHandler } from '../../services/index.js'

import newAlarm from './alarm/newAlarm'
import editAlarm from './alarm/editAlarm'

export default {
  components: {
    Button,
    newAlarm,
    editAlarm
  },
  data() {
    return {
      new_alarm: false,
      edit_alarm: false,
      list: [],
      numberLimit: 80
    }
  },
  ready() {
    requestHandler('getAlarms', {}, (res) => {
      this.list = res.body.data;
    })
  },
  methods: {
    add() {
      this.new_alarm = true;
      this.$broadcast('setType');
    },
    edit(alarm) {
      this.edit_alarm = true;
      this.$broadcast('getData', alarm);
    }
  },
  events: {
    hide() {
      this.new_alarm = false;
      this.edit_alarm = false;
      requestHandler('getAlarms', {}, (res) => {
        this.list = res.body.data;
      })
    }
  },
}
</script>