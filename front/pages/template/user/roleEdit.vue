<template>
<div class="user-add">
  <div class="station-edit-box">
    <header>
      <label @click="toUpPage">&lt;返回</label>
      <h2>修改角色</h2>
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
          <td class="title">角色</td>
          <td><input type="text" v-model="role.name"/></td>
        </tr>
        <tr>
          <td class="title">描述</td>
          <td><input type="text" v-model="role.description"/></td>
        </tr>
        <tr>
          <td class="title"></td>
          <td>
            <Button class="button-setting-big" style="margin-top: 30px;" text="保存" @click="signup"></Button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div v-if="type === 2">
    <Ztree name="role-edit" type="checkbox"></Ztree>
    <Button class="button-setting-big" style="margin-top: 30px;" text="保存" @click="saveSetting"></Button>
  </div>

  <div v-if="type === 3">
    <table class="table-header">
      <thead>
        <th>站点</th>
        <th>数据补登权限</th>
        <th>数据更新权限</th>
        <th>数据查询权限</th>
      </thead>
      <tbody>
        <tr v-for="i in stations_conf">
          <td>{{ i.station_name }}</td>
          <td><input type="checkbox" :checked="i.a" @click="modify(i, 'a')" /></td>
          <td><input type="checkbox" :checked="i.u" @click="modify(i, 'u')" /></td>
          <td><input type="checkbox" :checked="i.r" @click="modify(i, 'r')" /></td>
        </tr>
      </tbody>
    </table>

    <Button class="button-setting-big" style="margin-top: 30px;" text="保存" @click="updateStation"></Button>
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
      nav: [
        { name: '基本资料', active: true, type: 1 },
        { name: '配置功能菜单', active: false, type: 2 },
        { name: '配置站点', active: false, type: 3 },
      ],
      type: 1,
      role: {},
      menu: [],
      id: '',

      stations_conf: [],
    }
  },
  components: {
    Button,
    Ztree
  },
  methods: {
    changeType(nav) {
      for (let i of this.nav) {
        i.active = false;
      }
      nav.active = true;
      this.type = nav.type;

      if (nav.type === 2) {
        this.secondAction();
      } else if (nav.type === 3) {
        this.thirdAction();
      }
    },
    modify(item, type) {
      item[type] = !item[type];
    },
    signup() {
      requestHandler('editRole', {
        data: {
          id: this.role.id,
          name: this.role.name,
          description: this.role.description
        }
      }, (res) => {
        if (res.body.success === true) {
          this.$dispatch('Warning:dispatch', '修改角色成功', 'success');
        } else {
          this.$dispatch('Warning:dispatch', res.body.message, 'fail');
        }
      })
    },
    saveSetting() {
      this.$broadcast('getAllCheckedNodes');

      this.$nextTick(() => {
        const resource = this.$resource('/apis/role/menu{/id}');
        resource.update({
          id: this.role.id
        }, {
          roles: this.menu
        }).then(function (res) {
          if (res.body.success) {
            this.$dispatch('Warning:dispatch', '配置成功', 'success');
          } else {
            this.$dispatch('Warning:dispatch', res.body.message, 'fail');
          }
        })
      })
    },
    updateStation() {
      const resource = this.$resource('/apis/role/station{/id}');
      resource.update({
        id: this.role.id
      }, {
        stations: this.stations_conf
      }).then(function (res) {
        if (res.body.success) {
          this.$dispatch('Warning:dispatch', '配置成功', 'success');
        } else {
          this.$dispatch('Warning:dispatch', res.body.message, 'fail');
        }
      })
    },
    secondAction() {
      const resource = this.$resource('/apis/role/menu{/id}');
      resource.get({
        id: this.role.id
      }).then(function (res) {
        if (res.body.data && res.body.data.length > 0) {
          this.$broadcast('createZtree', res.body.data)
        }
      })
    },
    thirdAction() {
      const resource = this.$resource('/apis/role/station{/id}');
      resource.get({
        id: this.role.id
      }).then(function (res) {
        this.stations_conf = res.body.data;
      })
    },
    toUpPage() {
      this.$dispatch('back');
    },
    resetNav() {
      this.type = 1;
      for (let i of this.nav) {
        i.active = false;
      }
      this.nav[0].active = true;
    }
  },
  events: {
    'getCheckList'(list) {
      this.menu = [];
      for (let i = 0; i < list.length; i++) {
        this.menu.push(list[i].id);
      }
    },
    'recieveRole'(user) {
      this.role = user.data;
      this.resetNav();
    },
    'role_restart'() {
      this.changeType(this.nav[0]);
    }
  }
}
</script>