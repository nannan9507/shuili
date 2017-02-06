<!-- <template>
  <select v-model="time.type">
    <option value="date" selected="selected">日</option>
    <option value="week">周</option>
    <option value="month">月</option>
    <option value="year">年</option>
    <option value="setting">自定义</option>
  </select>

  <input type="date" v-show="time.type === 'date'" :value="time.value" />
  <input type="week" v-show="time.type === 'week'" :value="time.value" />
  <input type="month" v-show="time.type === 'month'" :value="time.value" />
  <select v-show="time.type === 'year'">
    <option v-for="i in 10"></option>
  </select>

  <button @click="getTime">aaa</button>
</template>

<script>
import moment from 'moment'


export default {
  data() {
    return {
      time: {
        type: '',
        value: moment().format('YYYY-MM-DD')
      }
    }
  },
  ready() {
    console.log(this.time.type)
  },
  methods: {
    getTime() {
      console.log(this)
    }
  }
}
</script>

<style>
select {
  width: 5em;
  height: 2em;
}
</style> -->