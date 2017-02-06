<script>
import $ from 'jquery'

export default {
  props: ['id'],
  template: `
    <input type="radio" id="{{ id }}-on" checked="checked" name="{{ id }}" value="true" />
    <input type="radio" id="{{ id }}-off" name="{{ id }}" value="false" />

    <label class="left checked" name="{{ id }}-on" for="{{ id }}-on" @click="turnOn($event)">启用</label>
    <label class="right" name="{{ id }}-off" for="{{ id }}-off" @click="turnOff($event)">停用</label>
  `,
  data() {
    return {}
  },
  methods: {
    turnOn(ev) {
      let _id = this.id;

      this.$nextTick(() => {
        $(ev.srcElement).addClass('checked');
        $($(ev.srcElement)[0].nextElementSibling).removeClass('checked');

        // $('input[type="radio"]').removeAttr('checked') && $('#'+$(this.id).attr('name')).attr('checked', 'checked');
      })
    },
    turnOff(ev) {
      this.$nextTick(() => {
        $(ev.srcElement).addClass('checked');
        $($(ev.srcElement)[0].previousElementSibling).removeClass('checked');

        // $('input[type="radio"]').removeAttr('checked') && $('#'+$(this.id).attr('name')).attr('checked', 'checked');
      })
    }
  }
}
</script>