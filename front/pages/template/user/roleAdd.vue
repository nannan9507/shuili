<template>
<div class="user-add">
  <header>
    <label @click="toUpPage"><i class="iconfont icon-iconback"></i>返回</label>
    <h2>新增角色</h2>
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
            <Button class="button-setting-big" style="margin-top: 30px;" text="下一步：配置功能菜单" @click="signup('next')"></Button>
          </td>
        </tr>
      </tbody>
    </table>

  </div>

  <div class="stage" v-show="stage.step === 2">
    <Ztree name="role" type="checkbox"></Ztree>
    <Button class="button-setting-big" style="margin-top: 30px;" text="下一步：配置站点权限" @click="saveSetting('next')"></Button>
  </div>

  <div class="stage" v-show="stage.step === 3">
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

    <Button class="button-setting-big" style="margin-top: 30px;" text="上一步" @click="back"></Button>
    <Button class="button-setting-big" style="margin-top: 30px;" text="完成" @click="updateStation"></Button>
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
      role: {},
      menu: [],
      id: '',

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
  methods: {
    modify(item, type) {
      item[type] = !item[type];
    },
    signup(next) {
      requestHandler('addRole', {
        data: {
          name: this.role.name,
          description: this.role.description
        }
      }, (res) => {
        if (res.body.success === true) {
          this.id = res.body.data.id;
          this.$dispatch('Warning:dispatch', '新增角色成功', 'success');
          if (next) {
            this.next();
          }
        } else {
          this.$dispatch('Warning:dispatch', res.body.message, 'fail');
        }
      })
    },
    saveSetting(next) {
      this.$broadcast('getAllCheckedNodes');

      this.$nextTick(() => {
        const resource = this.$resource('/apis/role/menu{/id}');
        resource.update({
          id: this.id
        }, {
          roles: this.menu
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
    updateStation() {
      const resource = this.$resource('/apis/role/station{/id}');
      resource.update({
        id: this.id
      }, {
        stations: this.stations_conf
      }).then(function (res) {
        if (res.body.success) {
          this.$dispatch('Warning:dispatch', '配置成功', 'success');
          this.$dispatch('back');
        } else {
          this.$dispatch('Warning:dispatch', res.body.message, 'fail');
        }
      })
    },
    secondAction() {
      const resource = this.$resource('/apis/role/menu{/id}');
      resource.get({
        id: this.id
      }).then(function (res) {
        if (res.body.data.length > 0) {
          this.$broadcast('createZtree', res.body.data);
        }
      })
    },
    thirdAction() {
      const resource = this.$resource('/apis/role/station{/id}');
      resource.get({
        id: this.id
      }).then(function (res) {
        this.stations_conf = res.body.data || [];
      })
    },
    next(params) {
      const past_step = '' + this.stage.step;
      this.stage[past_step].finish = true;

      const now_step = '' + ++this.stage.step;

      this.stage[now_step].pass = 'now';

      if (this.stage.step === 2) {
        this.secondAction();
      }

      if (this.stage.step === 3) {
        this.thirdAction();
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
    'getCheckList'(list) {
      if (list.length > 0) {
        for(let i = 0; i < list.length; i++) {
          this.menu.push(list[i].id);
        }
      }
    },
    'role_restart'() {
      this.role = {};
      this.menu = [];
      this.id = '';
      this.stations_conf = [];
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
    }
  }
}
</script>