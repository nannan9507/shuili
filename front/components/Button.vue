<script>
export default {
  props: ['disabled', 'text', 'timer'],
  template: `<button type="button" class="button" :disabled="button.disabled" @click="onceExec">{{ button.text }}</button>`,
  data() {
    return {
      button: {
        disabled: this.disabled || false,
        text: this.text || '',
        timer: this.timer || 0
      }
    }
  },
  methods: {
    onceExec() {
      if (timer) {
        clearTimeout(timer)
      };
      this.button.disabled = true;

      let timer = setTimeout(() => {
        this.button.disabled = false;
      }, this.button.timer);
    }
  }
}
</script>