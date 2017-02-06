<template>
<header>
  <nav-select></nav-select>
</header>
<router-view></router-view>
<factor-library v-show="type_selector === '因子库'"></factor-library>
<factor-parent v-show="type_selector === '因子母库'"></factor-parent>
</template>

<script>
import NavSelect from '../../components/NavSelect'
import factorLibrary from './factor/factorLibrary'
import factorParent from './factor/factorParent'

export default {
  components: {
    NavSelect,
    factorLibrary,
    factorParent
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