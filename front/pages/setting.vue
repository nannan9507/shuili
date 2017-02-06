<template>
<div class="container multiple setting">
  <div class="container-box">
    <side-bar :list="sideBarList"></side-bar>
    <div class="content-box">
      <router-view></router-view>
    </div>
  </div>
</div>
</template>

<script>
import { requestHandler } from '../services/index.js';
import SideBar from '../components/SideBar';

export default {
  components: {
    SideBar
  },
  data() {
    return {
      sideBarList: JSON.parse(localStorage.getItem('sideList')) || []
    }
  },
  route: {
    data(transition) {
      requestHandler('getCity', {}, (res) => {});

      document.title = '设置'
      // 清空所有
      for (let _item of this.sideBarList) {
        _item.active = false;
      }

      if (this.sideBarList.length > 0) {
        if (this.$route.path === '/setting') {
          if (localStorage.getItem('sideBar')) {
            this.$router.replace(localStorage.getItem('sideBar'));
          } else { //localStorage无, 默认返回第一个
            this.$router.replace(this.sideBarList[0].url);
          }
        } else {
          for (let _item of this.sideBarList) {
            if (_item.url === this.$route.path) {
              _item.active = true;
            }
          }
        }
      } else {
        this.$router.go('/');
      }
    }
  }
}
</script>