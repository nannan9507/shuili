<template>
  <nav v-show="showNav">
    <div class="logo" style="cursor: pointer;" @click="gotoHome"><img src="../images/GREAN22.png" /></div>
    <div class="profile">
      <span class="iconfont icon-tongzhi msg"></span>
      <span class="name" @click="extra"><b>{{ label_name }}<span class="iconfont icon-arrow"></span></b></span>
      <ul class="down-window" v-show="new_window">
        <li><a v-link="{ path: '/setting' }" @click="hideWindow">设置</a></li>
        <li><a v-link="{ path: '/login' }" @click="logout">注销</a></li>
      </ul>
    </div>
    <menu>
      <li v-for="nav in navList" :class="{ 'active': nav.active, 'open': nav.open }" @click="toggleSub($index)">
        <a>
          {{ nav.name }}
        </a>
        <div v-show="nav.open" class="dropdown" @click="showContent($event)">
          <div class="sub" v-for="item in nav.sub" @click="navigate(item)">{{ item.name }}</div>
        </div>
      </li>
    </menu>
    <div :class="{ 'overlay': overlay }" @click="init()"></div>
  </nav>
</template>

<script>
import { auth } from '../services/index.js'

// 计算index值
let addIndexNumber = (_number, _index) => {

  if (_number === _index.number) {
    _index.times++;
    if (_index.times === 2) {
      _index.number = -1;
      _index.times = 0;
    }
  } else {
    _index.number = _number;
    _index.times = 1;
  }

  return _index;
}

export default {
  data() {
    return {
      showNav: true,
      navList: [],
      overlay: false,
      new_window: false,
      label_name: '',
      saveData: {
        _index: {
          number: -1,
          times: 0,
        },
        nav: {
          now: 0
        }
      }
    }
  },
  ready() {
    this.label_name = localStorage.getItem('label_name') || '';
    this.navList = JSON.parse(localStorage.getItem('navList')) || [];

    this.activeUrl(this.navList);
  },
  methods: {
    init() {
      // 清空所有open状态
      for (let nav of this.navList) {
        nav.open = false;
      }

      this.new_window = false;

      this.saveData._index = {
        number: -1,
        times: 0
      }

      // 隐藏遮挡层
      this.overlay = false;
    },
    loadBarList() {
      if (localStorage.getItem('navList')) {
        for (let nav of JSON.parse(localStorage.getItem('navList'))) {
          nav.active = false;
          nav.open = false;
          this.navList.push(nav);
        }
      }

      this.activeUrl();
    },
    activeUrl() {
      // 目前active全部清空
      for (let i of this.navList) {
        i.active = false;
      }

      if (localStorage.getItem('navBar')) {

      } else { // 如果不存在记录下的保存点
        for (let nav of this.navList) {
          if (nav.url === this.$route.path) {
            nav.active = true;
          }
        }
      }
    },
    toggleSub(index) {
      let nav = this.navList[index];

      // 清空其他open状态
      for (let i = 0; i < this.navList.length; i++) {
        if (i !== index) {
          this.navList[i].open = false;
        }
      }

      // 如该nav存在sub且不为0的时候打开
      if (nav.sub && nav.sub.length > 0) {
        nav.open = !nav.open;

        // 打开遮挡层
        // 当检测是同一个按钮被点击时，关闭遮蔽层
        this.overlay = true;

        if (this.saveData._index.number === index) {
          this.overlay = false;
        }
      } else {
        // 点击没有nav的遮挡层时候隐藏overlay
        this.overlay = false;
        // 默认index
        this.showContent();
        // 路由跳转
        this.navigate(nav);
      }

      // 记录上一个index
      let _index = addIndexNumber(index, this.saveData._index);
      this.saveData._index.number = _index.number;
      this.saveData._index.times = _index.times;

      // 记录下点击的nav
      this.saveData.nav.now = index;
    },
    extra() {
      this.init();

      this.new_window = !this.new_window;

      this.overlay = !this.overlay;
    },
    showContent(event) {
      this.init();

      // 清除所有active
      for (let nav of this.navList) {
        nav.active = false;
      }

      this.$nextTick(() => {
        this.navList[this.saveData.nav.now].active = true;
      })

      if (event) {
        event.stopPropagation();
      }

    },
    navigate(nav) {
      this.$router.go(nav.url);
    },
    hideWindow() {
      this.new_window = false;
      this.init();

      for (let i of this.navList) {
        i.active = false;
      }
    },
    logout() {
      this.new_window = false;
      this.init();

      for (let i of this.navList) {
        i.active = false;
      }

      auth.logout(this);
    },
    gotoHome() {
      this.$router.go('/');
    }
  },
  events: {
    'getLabelName'(label_name) {
      this.label_name = localStorage.getItem('label_name');
    },
    'loadBar'() {
      this.navList = [];
      if (this.navList.length === 0) {
        this.loadBarList();
      }
    },
    changeActive() {
      this.activeUrl();
    },
    changeName(name) {
      this.label_name = name;
    },
    openNone() {
      for (let nav of this.navList) {
        nav.active = false;

        if (nav.sub && nav.sub.length > 0) {
          nav.active = true;
        }
      }
    }
  }
}
</script>