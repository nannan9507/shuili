<!-- <input type="checkbox" @click="choiceAll" v-model="inputAll" /> -->

<script>
import Vue from 'vue'
import Button from '../../../components/Button'
import Ztree from '../../../components/Ztree'
import { requestHandler } from '../../../services/index.js'

export default {
  template: `
<div class="user-manager-box">
  <div class="user-manager-ztree">
    <Ztree :list="nodes" name="stations"></Ztree>
  </div>
  <div class="user-manager-content">
    <div class="line header">
      {{ node.tname }}
      <Button class="button-setting" text="编辑部门" @click="editDepts"></Button> 
      <Button class="button-setting" text="添加部门" @click="addDepts"></Button>
    </div>

    <div class="line">部门人员</div>
    <div class="line">
      <Button class="button-setting" text="添加用户" @click="openNewWindow({ url: 'addUser' })"></Button> 
      <Button class="button-setting" style="background: rgb(255, 129, 129); border: none;" text="批量删除" @click="delUser"></Button>
    </div>

    <table class="table-header">
      <thead>
        <th></th>
        <th>姓名</th>
        <th>账户名</th>
        <th>手机号码</th>
        <th>重置密码</th>
      </thead>
      <tbody>
        <tr v-for="user in users">
          <td><input type="checkbox" v-model="user.checked_flag" /></td>
          <td><span @click="openNewWindow({ url: 'editUser', user: { type: 'user', data: user } })">{{ user.label_name }}</span></td>
          <td>{{ user.username }}</td>
          <td>{{ user.mobile }}</td>
          <td><span style="color: #2277da; padding: 0 5px; cursor: pointer;" @click="resetPass(user, $index)">重置</span></td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
  `,
  components: {
    Ztree,
    Button
  },
  data() {
    return {
      inputAll: false,
      nodes: [],
      node: {},
      users: [],
      delList: []
    }
  },
  ready() {
    this.getDeps();
  },
  methods: {
    setCheck(list, bool) {
      if (list && list.length > 0) {
        for (let i = 0; i < list.length; i++) {
          list[i].checked_flag = bool;
          const obj = Object.assign({}, list[i]);
          list.$set(i, obj);
        }
      }
    },
    // choiceAll() {
    //   this.inputAll = !this.inputAll;
    //   if (this.inputAll) {
    //     this.setCheck(this.users, true);
    //   } else {
    //     this.setCheck(this.users, false);
    //   }
    // },
    openNewWindow(obj) {
      this.$dispatch('open', obj.url, obj.user);
    },
    resetPass(user, index) {
      requestHandler('resetPass', {
        data: {
          id: user.id
        }
      }, (res) => {
        if (res.body.success) {
          this.$dispatch('Warning:dispatch', '重置成功', 'success');
        } else {
          this.$dispatch('Warning:dispatch', '重置失败', 'fail');
        }
      })
    },
    getDeps() {
      requestHandler('getDeps', {}, (cb) => {
        if (cb.body && cb.body.data) {
          this.nodes = cb.body.data;
          this.$broadcast('createZtree', this.nodes);
          for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].pId === 0) {
              // 获取站点用户
              this.getUsersById(this.nodes[i].id);
              this.node = this.nodes[i];
            }
          }
        }
      })
    },
    delUser() {
      this.delList = [];
      for (let i of this.users) {
        if (i.checked_flag) {
          this.delList.push(i.id);
        }
      }
      
      const resource = this.$resource('/apis/user/');
      resource.remove({}, {
        list: JSON.stringify(this.delList)
      }).then(function (cb) {
        if (cb.body.success) {
          for (let i = 0; i < this.users.length; i++) {
            for (let j = 0; j < this.delList.length; j++) {
              if (this.users[i].id === this.delList[j]) {
                this.users.splice(i, 1);
              }
            }
          }
        }
      })
    },
    getUsersById(id) {
      const resource = this.$resource('/apis/depart{/id}');
      resource.get({
        id: id 
      }).then(function (cb) {
        this.users = [];
        if (cb.body.data.length > 0) {
          for (let i of cb.body.data) {
            this.users.push(i);
          }
        }
        this.setCheck(this.users);
      })
    },
    editDepts() {
      // 打开mask
      this.$dispatch('openMask');

      const that = this;
      this.modal = Vue.modal({
        data() {
          return {
            modal: {
              title: '编辑部门',
              show: true,
              node: that.node,
              name: that.node.tname
            }
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
            <div class="content">
              <span>部门名称:</span> <input type="text" v-model="modal.name" />
            </div>
            <div class="footer">
              <button class="button-setting update" @click="update">更新</button>
              <button class="button-setting del" @click="del(modal.node.id)">删除</button>
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
            this.closeModal();

            if (this.modal.name === '') {
              this.modal.name = that.modal.tname;
            }
            // 服务器发送请求
            requestHandler('updateDeptName', {
              params: {
                id: this.modal.node.id,
                name: this.modal.name
              }
            }, (cb) => {
              if (cb.body.success) {
                for (let i = 0; i < that.nodes.length; i++) {
                  if (that.nodes[i].id === this.modal.node.id) {
                    this.modal.node.tname = this.modal.name;
                    that.nodes.splice(i, 1, this.modal.node);
                    that.$broadcast('updateZtree', this.modal.node);
                  }
                }
              } else {
                that.$dispatch('Warning:dispatch', cb.body.message, 'fail')
              }
            })
          },
          del(id) {
            this.closeModal();
            
            const resource = this.$resource('/apis/depart{/id}');
            resource.delete({
              id: id 
            }).then(function (cb) {
              if (cb.body.success) {
                that.$broadcast('removeZtree', this.modal.node);
              } else {
                that.$dispatch('Warning:dispatch', cb.body.message, 'fail')
              }
            })
          }
        }
      })
    },
    addDepts() {
      // 打开mask
      this.$dispatch('openMask');

      const that = this;
      this.modal = Vue.modal({
        data() {
          return {
            modal: {
              title: '添加部门',
              show: true,
              node: that.node,
              dept: ''
            }
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
            <div class="content">
              <span>部门名称:</span> <input type="text" v-model="modal.dept" />
            </div>
            <div class="footer">
              <button class="button-setting add" @click="add">添加</button>
            </div>
          </div>
        </div>
        `,
        methods: {
          closeModal() {
            that.$dispatch('closeMask');
            this.modal.show = false;
          },
          add() {
            // if (this.modal.tId) {
              this.closeModal();

              if (this.modal.dept !== '') {
                // 服务器发送请求
                requestHandler('addDept', {
                  data: {
                    id: this.modal.node.id,
                    name: this.modal.dept
                  }
                }, (cb) => {
                  if (cb.body.success) {
                    cb.body.data.tname = cb.body.data.name;
                    cb.body.data.name = cb.body.data.name + '('+cb.body.data.userCount+')';
                    that.nodes.push(cb.body.data);
                    that.$broadcast('addZtree', this.modal.node, cb.body.data);
                  }
                })
              }
            // } else {
            //   that.$dispatch('Warning:dispatch', '添加失败, 没有站点被选中', 'fail');
            // }
          }
        }
      })
    }
  },
  events: {
    getNode(node) {
      this.node = node;
      this.users = this.getUsersById(node.id);
      this.setCheck(this.users);
    },
    'reFetch'() {
      this.getDeps();
    }
  }
}
</script>