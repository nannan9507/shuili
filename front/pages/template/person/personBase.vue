<script>
import Vue from 'vue'
import Button from '../../../components/Button'
import Warning from '../../../components/Warning'
import { requestHandler } from '../../../services/index.js'

export default {
  components: {
    Button,
    Warning
  },
  template: `
  <div class="person-base">
    <form novalidate>
      <table class="table-form">
        <tr>
          <td class="title"><span style="color: red;">*</span>姓名</td>
          <td><input type="text" v-model="name" />
        </tr>
        <tr>
          <td class="title"><span style="color: red;">*</span>手机号码</td>
          <td><input type="text" v-model="mobile" type="text" /></td>
        </tr>
        <tr>
          <td class="title">登录账户</td>
          <td>{{ username }}</td>
        </tr>
        <tr>
          <td class="title">所属部门</td>
          <td>{{ dept_name }}</td>
        </tr>
        <tr>
          <td class="title"></td>
          <td>
            <Button class="button-base" text="保存" @click="signUp"></Button>
          </td>
        </tr>
      </table>
    </form>
  </div>
  `,
  data() {
    return {
      name: '',
      mobile: '',
      username: '',
      dept_name: '',
      warning_text: '',
      system_error: true
    }
  },
  ready() {
    const resource = this.$resource('/apis/user{/id}');
    resource.get({
      id: localStorage.getItem('user_id')
    }).then(function (cb) {
      if (cb.body.data) {
        this.name = cb.body.data.label_name;
        this.mobile = cb.body.data.mobile;
        this.username = cb.body.data.username;
        this.dept_name = cb.body.data.dept_name;
      }
    })
  },
  methods: {
    signUp() {
      requestHandler('updateUser', {
        params: {
          user_id: localStorage.getItem('user_id'),
          name: this.name,
          phone: this.mobile
        }
      }, (cb) => {
        if (cb.body.success) {
          this.$dispatch('Warning:dispatch', '修改成功', 'success');
          localStorage.setItem('label_name', this.name);
          this.$dispatch('changeLabelName', this.name);
        } else {
          this.$dispatch('Warning:dispatch', cb.body.message, 'fail');
        }
      })
    }
  }
}
</script>