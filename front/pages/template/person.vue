<template>
<div class="person-box">
  <header>
    <nav-select></nav-select>
  </header>
  <person-base v-show="type_selector === '基本信息'"></person-base>
  <person-edit v-show="type_selector === '修改密码'"></person-edit>
</div>
</template>

<script>
import NavSelect from '../../components/NavSelect'
import personBase from './person/personBase'
import personEdit from './person/personEdit'

export default {
  components: {
    'nav-select': NavSelect,
    'person-base': personBase,
    'person-edit': personEdit
  },
  data() {
    return {
      type_selector: ''
    }
  },
  events: {
    type(name) {
      this.type_selector = name;
    }
  }
}
</script>