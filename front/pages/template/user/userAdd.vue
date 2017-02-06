<template>
<div class="user-add">
  <header>
    <label @click="toUpPage"><i class="iconfont icon-iconback"></i>返回</label>
    <h2>新增用户</h2>
  </header>

  <div class="type-box">
    <div class="button-box">
      <div class="circle-box" :class="{ 'active': stage['1'].pass === 'now', 'done': stage['1'].finish }">
        <div class="circle"></div>
        基本资料
      </div>
    </div>
    <div class="button-box">
      <div class="circle-box" :class="{ 'active': stage['2'].pass === 'now', 'done': stage['2'].finish }">
        <div class="circle"></div>
        配置功能菜单
      </div>
    </div>
    <div class="button-box">
      <div class="circle-box" :class="{ 'active': stage['3'].pass === 'now', 'done': stage['3'].finish }">
        <div class="circle"></div>
        配置站点权限
      </div>
    </div>
  </div>

  <div class="stage" v-show="stage.step === 1">  
    <table class="table-form">
      <tbody>
        <tr>
          <td class="title">登录账户</td>
          <td><input type="text" v-model="username"/></td>
        </tr>
        <tr>
          <td class="title">登录密码</td>
          <td><input type="text" v-model="password"/></td>
        </tr>
        <tr>
          <td class="title">角色选择</td>
          <td><Ztree name="user-role" type="checkbox"></Ztree></td>
        </tr>
        <tr>
          <td class="title">工作部门</td>
          <td><input type="text" :value="department.tname" @click="openModal($event)"/></td>
        </tr>
        <tr>
          <td class="title">用户姓名</td>
          <td><input type="text" v-model="name"/></td>
        </tr>
        <tr>
          <td class="title">手机号码</td>
          <td><input type="text" v-model="phone"/></td>
        </tr>
        <tr>
          <td class="title"></td>
          <td>
            <Button class="button-setting-big" text="下一步：配置功能菜单" @click="signup('next')"></Button>
            <span class="btn" @click="signup">跳过后面步骤，直接完成</span>
          </td>
        </tr>
      </tbody>
    </table>

  </div>

  <div class="stage" v-show="stage.step === 2">
    <Ztree name="user" type="checkbox"></Ztree>
    <Button class="button-setting-big" style="margin-top: 30px;" text="下一步：配置站点权限" @click="saveMenu('next')"></Button>
  </div>

  <div class="stage" v-show="stage.step === 3">
    <table class="table-header">
      <thead>
        <th>站点</th>
        <th>数据补登权限</th>
        <th>数据审核权限</th>
        <th>数据查询权限</th>
        <th>数据反审核权限</th>
      </thead>
      <tbody>
        <tr v-for="i in stations_conf">
          <td>{{ i.station_name }}</td>
          <td><input type="checkbox" :checked="i.a" @click="modify(i, 'a')" /></td>
          <td><input type="checkbox" :checked="i.u" @click="modify(i, 'u')" /></td>
          <td><input type="checkbox" :checked="i.r" @click="modify(i, 'r')" /></td>
          <td><input type="checkbox" :checked="i.s" @click="modify(i, 's')" /></td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 30px;">
      <Button class="button-setting-big" text="上一步" @click="back"></Button>
      <Button class="button-setting-big" text="完成" @click="saveStation"></Button>
    </div>
  </div>
</div>
</template>

<script>
import Vue from 'vue'
import Button from '../../../components/Button'
import { requestHandler } from '../../../services/index.js'
import Ztree from '../../../components/Ztree.vue'

export default {
  data() {
    return {
      username: '',
      password: '',
      department: {},
      name: '',
      phone: '',
      userId: '',
      menu_auth: [],
      role_start: [],
      deps: [],
      roles: [],

      stations_conf: [],
      stage: {
        step: 1,
        1: {
          pass: 'now',
          finish: false
        },
        2: {
          pass: '',
          finish: false
        },
        3: {
          pass: '',
          finish: false
        }
      }
    }
  },
  components: {
    Button,
    Ztree
  },
  ready() {
    requestHandler('getRoles', {}, (res) => {
      this.role_start = res.body.data || [];
      this.$broadcast('createZtree', this.role_start);
    })

    this.deps = [];
    requestHandler('getDeps', {}, (res) => {
      if (res.body.data.length > 0) {
        for (let i = 0; i < res.body.data.length; i++) {
          if (res.body.data[i].pId !== 0) {
            this.deps.push(res.body.data[i]);
          }
        }
      }
    })
  },
  methods: {
    modify(item, type) {
      item[type] = !item[type];
    },
    openModal(event) {
      this.$dispatch('openMask');
      event.target.blur();

      this.$nextTick(() => {      
        const that = this;

        this.modal = Vue.modal({
          data() {
            return {
              modal: {
                title: '选择部门',
                show: true,
                deps: that.deps
              },
            }
          },
          template: `
          <div class="modal" v-show="modal.show">
            <div class="mask"></div>
            <div class="paper">
              <div class="header">
                <h3>{{ modal.title }}</h3>
                <div class="close" @click="closeModal"></div>
              </div>
              <div class="content" style="max-height: 300px; overflow-y: scroll; padding-top: 5px; padding-bottom: 5px;">
                <div v-for="item in modal.deps"><span style="color: #2277da; font-size: 14px; cursor: pointer;" @click="choiceDeps(item)">{{ item.tname }}</span></div>
              </div>
              <div class="footer">
                <button class="button-setting update" @click="update">选择</button>
              </div>
            </div>
          </div>
          `,
          methods: {
            closeModal() {
              that.$dispatch('closeMask');
              this.modal.show = false;
            },
            update() {
              this.deps = that.deps;
              this.closeModal();
            },
            choiceDeps(item) {
              that.department = item;
            }
          }
        })
      })
    },
    signup(next) {
      this.$broadcast('getAllCheckedNodes');

      requestHandler('saveUser', {
        data: {
          username: this.username,
          password: this.password,
          role: this.roles,
          department: this.department.id,
          name: this.name,
          phone: this.phone
        }
      }, (res) => {
        if (res.body.success) {
          this.$dispatch('Warning:dispatch', '添加成功', 'success');
          this.userId = res.body.data.id;
          if (next) {
            this.next();
          }
        } else {
          this.$dispatch('Warning:dispatch', res.body.message, 'fail');
        }
      })
    },
    getMenu() {
      const resource = this.$resource('/apis/user/menu{/id}');
      resource.get({
        id: this.userId
      }).then(function (res) {
        if (res.body.success) {
          if (res.body.data.length > 0) {
            this.$broadcast('createZtree', res.body.data);
          }
        } else {
          this.$dispatch('Warning:dispatch', res.body.message, 'fail');
        }
      })
    },
    saveMenu(next) {
      this.menu_auth = [];
      this.$nextTick(() => {
        this.$broadcast('getAllCheckedNodes');
      })


      this.$nextTick(() => {
        const resource = this.$resource('/apis/user/menu{/id}/update');
        resource.update({
          id: this.userId
        }, {
          menu_auth: this.menu_auth
        }).then(function (res) {
          if (res.body.success) {
            this.$dispatch('Warning:dispatch', '配置成功', 'success');
            if (next) {
              this.next();
            }
          } else {
            this.$dispatch('Warning:dispatch', res.body.message, 'fail');
          }
        })
      })
    },
    getStation() {
      const resource = this.$resource('/apis/user/station{/id}');
      resource.get({
        id: this.userId
      }).then(function (res) {
        this.stations_conf = res.body.data || [];
      })
    },
    saveStation() {
      const resource = this.$resource('/apis/user/station{/id}/update');
      resource.update({
        id: this.userId
      }, {
        station_auth: this.stations_conf
      }).then(function (res) {
        if (res.body.success) {
          this.$dispatch('Warning:dispatch', '配置成功', 'success');
          this.$dispatch('back');
        } else {
          this.$dispatch('Warning:dispatch', res.body.message, 'fail');
        }
      })
    },
    next() {
      // console.log('向服务器发送信息');
      const past_step = '' + this.stage.step;
      this.stage[past_step].finish = true;

      const now_step = '' + ++this.stage.step;

      this.stage[now_step].pass = 'now';

      if (this.stage.step === 2) {
        this.getMenu();
      }

      if (this.stage.step === 3) {
        this.getStation();
      }
    },
    back() {
      const past_step = '' + this.stage.step;
      this.stage[past_step].pass = '';

      const now_step = '' + --this.stage.step;

      this.stage[now_step].finish = false;
    },
    toUpPage() {
      this.$dispatch('back');
    }
  },
  events: {
    'reset'() {
      requestHandler('getRoles', {}, (res) => {
        this.role_start = res.body.data || [];
        this.$broadcast('createZtree', this.role_start);
      })

      this.stage = {
        step: 1,
        1: {
          pass: 'now',
          finish: false
        },
        2: {
          pass: '',
          finish: false
        },
        3: {
          pass: '',
          finish: false
        }
      }

    },
    'getCheckList'(list) {
      if (list.length > 0) {
        for(let i = 0; i < list.length; i++) {
          this.menu_auth.push(list[i].id);
        }
      }
    },
    'checkNode'(node, name) {
      if (name === 'user-role') {
        let flag = true;
        for (let i = 0; i < this.roles.length; i++) {
          if (this.roles[i] === node.id) {
            this.roles.splice(i, 1);
            flag = false;
          }
        }

        if (flag) {
          this.roles.push(node.id);
        }
      }
    }
  }
}
</script>