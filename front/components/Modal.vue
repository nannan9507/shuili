<template>
  <div class="paper" v-show="show">>
    <slot name="header">
      <div class="close" @click="hide"></div>
    </slot>
    <slot name="content"></slot>
    <slot name="footer"></slot>
  </div>
</template>

<script>
export default {
  props: ['show'],
  data() {
    console.log(this.show)
    return {
      status: this.show
    }
  },
  methods: {
    hide() {
      this.show = false;
    }
  },
  events: {
    openMask() {
      this.show = true;
    },
    hideMask() {
      this.show = false;
    }
  }
}
</script>