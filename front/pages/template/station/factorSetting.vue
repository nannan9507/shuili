<template>
<div class="factor-setting">
  <table class="table-header">
    <thead>
      <th>因子名称</th>
      <th>单位</th>
      <th>应用</th>
    </thead>
    <tbody>
      <tr v-for="i in list">
        <td>{{ i.name }}</td>
        <td>{{ i.m_unit }}</td>
        <td>
          <span class="btn special" @click="setting(i)" v-text="i.selected ? '是' : '否' "></span>
        </td>
      </tr>
    </tbody>
  </table>
  <Button class="button-setting-big" style="margin-top: 30px;" text="保存配置" @click="saveSetting()"></Button>
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
      update_factors: []
    }
  },
  methods: {
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
    saveSetting() {
      requestHandler('updateStationFactor', {
        data: {
          id: this.station_id,
          factors: this.update_factors
        }
      }, (res) => {
        if (res.body.success === false) {
          this.$dispatch('Warning:dispatch', res.body.message, 'fail');
        } else {
          this.$dispatch('Warning:dispatch', '因子配置成功', 'success');
        }
      })
    }
  },
  events: {
    getStationFactor(station_id, list) {
      this.list = [];
      this.station_id = '';

      this.station_id = station_id;
      for (let i = 0; i < list.length; i++) {
        this.list.push(list[i]);
        if (list[i].selected === true) {
          this.update_factors.push(list[i].id);
        }
      }

    },
  }
}
</script>