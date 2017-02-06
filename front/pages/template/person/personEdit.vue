<script>
import VueButton from '../../../components/Button'
import Warning from '../../../components/Warning'
import { requestHandler } from '../../../services/index'

export default {
  template: `
  <div>
    <div class="form-errors">
      <span v-show="warning_text.length > 0">{{ warning_text }}</span>
    </div>
    <form novalidate>
      <table class="table-form">
        <tr>
          <td class="title"><span style="color: red;">*</span>旧密码</td>
          <td><input type="text" name="password" v-model="password" /></td>
        </tr>
        <tr>
          <td class="title"><span style="color: red;">*</span>新密码</td>
          <td><input type="password" name="pass" v-model="pass" /></td>
        </tr>
        <tr>
          <td class="title"><span style="color: red;">*</span>重复新密码</td>
          <td><input type="password" name="newPassCheck" v-model="newPassCheck"/></td>
        </tr>
        <tr>
          <td class="title"></td>
          <td>
            <button type="button" class="button-base" @click="changePass">保存</button>
          </td>
        </tr>
      </table>
    </form>
  </div>
  `,
  components: {
    VueButton,
    Warning
  },
  data() {
    return {
      password: '',
      pass: '',
      newPassCheck: '',
      warning_text: '',
      timer: {}
    }
  },
  methods: {
    message(text) {
      this.warning_text = text;
      this.system_error = false;

      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(() => {
        this.warning_text = '';
        this.system_error = true;
      }, 3000);      
    },
    changePass() {
      if (this.pass !== this.newPassCheck) {
        this.message('新密码验证不一致，请重新输入');
        return;
      }

      const resource = this.$resource('/apis/user/password/change');
      resource.update({}, {
        user_id: localStorage.getItem('user_id'),
        new_password: this.pass,
        old_password: this.password
      }).then((res) => {
        if (res.body.success) {
          this.$dispatch('Warning:dispatch', '修改成功', 'success');
          this.password = '';
          this.pass = '';
          this.newPassCheck = '';
        } else {
          this.$dispatch('Warning:dispatch', res.body.message, 'fail');
        }
      })

    }
  }
}
</script>