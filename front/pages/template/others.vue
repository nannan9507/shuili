<template>
<div class="others-box">

  <div class="unit-box">
    <div class="header">设置系统名称</div>
    <div class="content">
      <table class="table-form">
        <tr>
          <td>系统名称</td>
          <td><input type="text" v-model="sys_name"/></td>
        </tr>
        <tr>
          <td>单位名称</td>
          <td><input type="text" v-model="company_name"/></td>
        </tr>
        <tr>
          <td></td>
          <td><Button class="button-base" text="保存" @click="changeName"></Button></td>
        </tr>
      </table>
    </div>
  </div>

<!--   <div class="unit-box">
    <div class="header">logo上传</div>
    <div class="content">
      <table class="table-form">
        <tr>
          <td>当前logo</td>
          <td><img src="/" /></td>
        </tr>
        <tr>
          <td></td>
          <td>
            <Button class="button-base" text="上传Logo"></Button>
            <input type="file" class="file" />
          </td>
        </tr>
      </table>
    </div>
    <div class="bottom">
      Logo的尺寸高度未32px，宽度低于15个汉字
    </div>
  </div> -->
</div>
</template>

<script>
import NavSelect from '../../components/NavSelect'
import Button from '../../components/Button'

export default {
  components: {
    NavSelect,
    Button
  },
  data() {
    return {
      sys_name: '',
      company_name: ''
    }
  },
  ready() {
    const resource = this.$resource('/apis/station/home/setting')

    resource.get({}).then((res) => {
      this.sys_name = res.body.data.sys_name;
      this.company_name = res.body.data.company_name;
    })
  },
  methods: {
    changeName() {
      const resource = this.$resource('/apis/station/home/setting')

      resource.update({}, {
        sys_name: this.sys_name,
        company_name: this.company_name
      }).then((res) => {
        if (res.body.success) {
          document.title = this.sys_name;
          localStorage.setItem('sys_name', this.sys_name);
          localStorage.setItem('company_name', this.company_name);
          this.$dispatch('Warning:dispatch', '修改成功', 'success');
        } else {
          this.$dispatch('Warning:dispatch', '修改失败', 'fail');
        }
      })
    }
  }
}
</script>