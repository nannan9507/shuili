<template>
<div class="user-add">
  <div class="station-edit-box">
    <header>
      <label @click="toUpPage">&lt;返回</label>
      <h2>修改用户</h2>
      <ul class="nav-select">
        <li v-for="i in nav" :class="{ 'active': i.active }" @click="changeType(i)">
          <b>{{ i.name }}</b>
        </li>
      </ul>
    </header>
  </div>

  <div v-if="type === 1">  
    <table class="table-form">
      <tbody>
        <tr>
          <td class="title">登录账户</td>
          <td>{{user.username}}</td>
        </tr>
        <tr>
          <td class="title">角色选择</td>
          <td><Ztree name="user-role-edit" type="checkbox"></Ztree></td>
        </tr>
        <tr>
          <td class="title">工作部门</td>
          <td><input type="text" :value="user.dept_name" @click="openModal($event)"/></td>
        </tr>
        <tr>
          <td class="title">用户姓名</td>
          <td><input type="text" v-model="user.label_name"/></td>
        </tr>
        <tr>
          <td class="title">手机号码</td>
          <td><input type="text" v-model="user.mobile"/></td>
        </tr>
        <tr>
          <td class="title"></td>
          <td>
            <Button class="button-setting-big" text="保存" @click="signup()"></Button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div v-if="type === 2">
    <Ztree name="user-station-edit" type="checkbox"></Ztree>
    <Button class="button-setting-big" style="margin-top: 30px;" text="保存" @click="saveMenu('next')"></Button>
  </div>

  <div v-if="type === 3">
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

    <Button class="button-setting-big" style="margin-top: 30px;" text="保存" @click="saveStation"></Button>
  </div>
</div>
</template>

<script>
import Button from '../../../components/Button'
import { requestHandler } from '../../../services/index.js'
import Ztree from '../../../components/Ztree.vue'

export default {
  data() {
    return {
      nav: [
        { name: '基本资料', active: true, type: 1 },
        { name: '配置功能菜单', active: false, type: 2 },
        { name: '配置站点', active: false, type: 3 },
      ],
      type: 1,
      user: {},
      username: '',
      password: '',
      department: '',
      name: '',
      phone: '',
      userId: '',
      menu_auth: [],
      role_start: [],
      deps: [],
      roles: [],

      stations_conf: [],
    }
  },
  components: {
    Button,
    Ztree
  },
  ready() {
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
    changeType(nav) {
      for (let i of this.nav) {
        i.active = false;
      }
      nav.active = true;
      this.type = nav.type;

      if (nav.type === 1) {
        this.getRole();
      } else if (nav.type === 2) {
        this.getMenu();
      } else if (nav.type === 3) {
        this.getStation();
      }
    },
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
              that.department = item.id;
              that.user.dept_name = item.tname;
            }
          }
        })
      })
    },
    signup() {
      const resource = this.$resource('/apis/user{/id}');
      resource.update({
        id: this.user.id
      }, {
        role: this.roles,
        department: this.department,
        name: this.user.label_name,
        phone: this.user.mobile
      }).then(function (res) {
        if (res.body.success) {
          this.$dispatch('Warning:dispatch', '修改成功', 'success');
        } else {
          this.$dispatch('Warning:dispatch', res.body.message, 'fail');
        }
      })
    },
    getRole() {
      // 获取role
      const resource2 = this.$resource('/apis/user/role{/id}');
      resource2.get({
        id: this._flag.data.id
      }).then((res) => {
        if (res.body.success) {
          if (res.body.data.length > 0) {
            new Promise((resolve, reject) => {
              resolve();
            }).then(() => {
              this.$broadcast('createZtree', res.body.data);
            }).then(() => {
              this.$broadcast('getAllCheckedNodes');
            })
          }
        } else {
          this.$dispatch('Warning:dispatch', res.body.message, 'fail');
        }
      })
    },
    getMenu() {
      const resource = this.$resource('/apis/user/menu{/id}');
      resource.get({
        id: this.user.id
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
    saveMenu() {
      this.menu_auth = [];
      this.$broadcast('getAllCheckedNodes');


      this.$nextTick(() => {
        const resource = this.$resource('/apis/user/menu{/id}/update');
        resource.update({
          id: this.user.id
        }, {
          menu_auth: this.menu_auth
        }).then(function (res) {
          if (res.body.success) {
            this.$dispatch('Warning:dispatch', '配置成功', 'success');
          } else {
            this.$dispatch('Warning:dispatch', res.body.message, 'fail');
          }
        })
      })
    },
    getStation() {
      const resource = this.$resource('/apis/user/station{/id}');
      resource.get({
        id: this.user.id
      }).then(function (res) {
        this.stations_conf = res.body.data || [];
      })
    },
    saveStation() {
      const resource = this.$resource('/apis/user/station{/id}/update');
      resource.update({
        id: this.user.id
      }, {
        station_auth: this.stations_conf
      }).then(function (res) {
        if (res.body.success) {
          this.$dispatch('Warning:dispatch', '配置成功', 'success');
        } else {
          this.$dispatch('Warning:dispatch', res.body.message, 'fail');
        }
      })
    },
    toUpPage() {
      this.$dispatch('back');
    }
  },
  events: {
    'getCheckList'(list, name) {
      if (list.length === 0) {
        return;
      }
      if (name === 'user-role-edit') {
        for (let i of list) {
          this.roles.push(i.id);
        }
      } else if (name === 'user-station-edit') {
        for (let i = 0; i < list.length; i++) {
          this.menu_auth.push(list[i].id);
        }
      }
    },
    'checkNode'(node, name) {
      if (name === 'user-role-edit') {
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
    },
    recieveUser(user) {
      this._flag = user;
      const resource = this.$resource('/apis/user{/id}');
      resource.get({
        id: user.data.id
      }).then((res) => {
        this.user = res.body.data;

        this.department = this.user.dept_id;

        // 获取role
        const resource2 = this.$resource('/apis/user/role{/id}');
        resource2.get({
          id: user.data.id
        }).then((res) => {
          if (res.body.success) {
            if (res.body.data.length > 0) {
              new Promise((resolve, reject) => {
                resolve();
              }).then(() => {
                this.$broadcast('createZtree', res.body.data);
              }).then(() => {
                this.$broadcast('getAllCheckedNodes');
              })
            }
          } else {
            this.$dispatch('Warning:dispatch', res.body.message, 'fail');
          }
        })
      })
    },
    'reset'() {
      this.changeType(this.nav[0]);
    }
  }
}
</script>