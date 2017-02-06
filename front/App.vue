<template>
  <div id="app">
    <!-- banner -->
    <div class="mask" v-show="mask.show">
      <img v-show="mask.icon" src="/dist/images/timg.gif" class="center" style="width: 100px; height: 100px;" />
    </div>
    <Warning></Warning>
    <nav-bar v-show="show"></nav-bar>
    <router-view></router-view>
  </div>
</template>

<script>
  import config from './helper/config'
  import store from './vuex/store'

  import NavBar from './components/NavBar'
  import SideBar from './components/SideBar'
  import Warning from './components/Warning'

  import timg from './images/timg.gif'

  import { requestHandler, tokenHandler } from './services'


  const isIE = navigator.userAgent.indexOf('MSIE') > -1 || navigator.userAgent.indexOf('rv:11') > -1;
  if (isIE) {
    $('#app').addClass('ie');
  }

  export default {
    store,
    data() {
      return {
        show: true,
        mask: {
          show: false,
          icon: false
        }
      }
    },
    components: {
      NavBar,
      Warning
      // 'side-bar': SideBar
    },
    methods: {
      hide() {
        this.modal.appear = false;
      }
    },
    events: {
      showNavbar() {
        this.show = true;
      },
      hideNavbar() {
        this.show = false;
      },
      reSendLabelname() {
        this.$broadcast('getLabelName');
      },
      reSendBarList() {
        this.$broadcast('loadBar');
      },
      reSendChangeActive() {
        this.$broadcast('changeActive');
      },
      openMask(icon) {
        this.mask.show = true;

        if (icon) {
          this.mask.icon = true;
        }
      },
      closeMask() {
        this.mask.show = false;
      },
      'Warning:dispatch'(text, status) {
        this.$broadcast('Warning:show', text, status);
      },
      changeLabelName(name) {
        this.$broadcast('changeName', name);
      },
      'reSendOpenNone'() {
        this.$broadcast('openNone');
      }
    }
  }
</script>