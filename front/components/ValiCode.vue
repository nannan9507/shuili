<template>
  <div class="vcode" v-show="vcode.showVcode">
    <input type="text" placeholder="验证码" />
    <img src="/apis/user/vcode" @click="changePic($event)" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      vcode: {
        pic: '',
        showVcode: true
      }
    }
  },
  ready() {
    console.log(this.vcode)
  },
  methods: {
    changePic(event) {
      event.target.src = '/apis/user/vcode?timestamp=' + Math.random();
    }
  }
}
</script>

<style>
.vcode {
  margin-top: 1em;
  input {
    margin: 0!important;
    width: 30%!important;
    border: thin solid #CCC;
  }
  img {
    width: 10em;
    height: 2em;
    vertical-align: middle;
    cursor: pointer;
  }
}
</style>