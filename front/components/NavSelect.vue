<script>

export default {
  props: ['from', 'list'],
  data() {
    if (!this.from) {
      this.from = 'sideList';
    }

    const select = JSON.parse(localStorage.getItem(this.from)) || [];

    if (select.length > 0) {
      for (let i of select) {
        i.active = false;
      }
    }

    const route_num = this.$route.matched.length;
    const _route = this.$route.matched[route_num-1].handler.path;

    let sub = [];
    if (this.list && this.list.length > 0) {
      sub = [...this.list];
    } else {
      for (let bar of select) {
        if (bar.navSelect) {
          if (bar.type === 'navList' && bar.url === _route) {
            sub = bar.navSelect;
            break;
          }

          if (bar.type === 'sidebarlist' && bar.url === '/setting'+_route) {
            sub = bar.navSelect;
            break;
          }
        }
      }
    }

    // 全部设置默认值
    for (let i of sub) {
      i.active = false;
    }
    // 如果只前有active时, 不操作, 否则显示第一个
    if (sub && sub.length > 0) {
      let flag;
      for (let i of sub) {
        if (i.active) {
          flag = i;
          this.$dispatch('type', flag.name);
          break;
        }
      }

      if (!flag) {
        let index = 0;
        sub[index].active = true;
        this.$dispatch('type', sub[index].name, sub[index]);
      }
    }

    return {
      navSelect: sub
    }
  },
  template: `
  <ul class="nav-select">
    <li :class="{ 'active': item.active }" v-for="item in navSelect" @click="toggle(item)">
      <b>{{ item.name }}</b>
    </li>
  </ul>
  `,
  methods: {
    toggle(item) {
      for (let _item of this.navSelect) {
        _item.active = false;
      }

      item.active = true;
      this.$dispatch('type', item.name);
    }
  }
}
</script>