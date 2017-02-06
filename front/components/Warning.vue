<script>
export default {
  props: {
    text: {
      type: String,
      required: false,
      default() {
        return ''
      }
    },
    show_status: {
      type: Boolean,
      required: false,
      default() {
        return false
      }
    }
  },
  data() {
    return {
      show: this.show_status || false,
      status: '',
      // clark: this.text.length * 200 || 3000,
      clark: 3000,
      timer: {}
    }
  },
  template: 
  `
  <div class="warning top {{ status }}" v-show="show_status">
    <div class="close">
      <div class="close-btn"></div>
    </div>
    <div class="content">{{ text }}</div>
  </div>
  `,
  events: {
    'Warning:show'(text, status) {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.show_status =  true;
      this.text = text;
      this.status = status;

      this.timer = setTimeout(() => {
        this.show_status = false;
      }, this.clark);
    }
  }
}
</script>