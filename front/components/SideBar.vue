<script>

export default {
  props: ['list'],
  ready() {
    for (let i = 0; i < this.list.length; i++) {
      if (this.list[i].name === '设置') {
        this.list.splice(i, 1);
      }
    }
  },
  template: `
  <ul class="side-bar">
    <li :class="{ 'active': item.active }" v-for="item in list" @click="toggle(item)">{{ item.name }}</li>
  </ul>

  `,
  methods: {
    toggle(item) {
      for (let _item of this.list) {
        _item.active = false;
        // 获取到指定的对象
        if (_item.name === item.name) {
          this.navSelectlist = item.sub;
        }
      }

      item.active = true;
      localStorage.setItem('sideBar', item.url);

      this.$router.go(item.url);
    }
  }
}
</script>