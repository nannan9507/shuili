<script>
export default {
  props: ['style', 'all', 'title', 'line'],
  data() {
    return {}
  },
  template: `
  <table :class=" 'table-' + style ">
    <thead>
      <th v-show=" style === 'underline' "></th>
      <th><input type="checkbox" v-show="all" /></th>
      <th v-for="item in title">{{ item.value }}</th>
    </thead>
    <tbody>
      <tr v-for="item in line">
        <td v-show=" style === 'underline' ">1</td>
        <td><input type="checkbox" v-show="all" /></td>
        <td v-for="result in item">{{ result }}</td>
      </tr>
    </tbody>
  </table>
  `
}
</script>