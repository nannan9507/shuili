<script>
export default {
  props: ['data', 'edit'],
  template: 
  `
    <span v-show="!isCanEdit" @click="toggleEditor($event)">{{ newData ? newData : data }}</span>
    <input v-show="isCanEdit" type="text" value="{{ newData ? newData : data }}" @blur="toggleEditor" v-model="newData" />
  `,
  data() {
    return {
      isCanEdit: false,
      newData: ''
    }
  },
  ready() {
     this.isCanEdit = this.edit || false;
  },
  methods: {
    toggleEditor(ev) {
      this.isCanEdit = !this.isCanEdit;
    }
  },
  events: {
    editDiv() {
      this.$dispatch('start');
      this.isCanEdit = true;
    },
    finishEdit() {
      this.$dispatch('finish');
      this.isCanEdit = false;
    }
  }
}
</script>