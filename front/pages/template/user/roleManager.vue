<template>
<div class="role-manager">
  <div class="line">角色</div>
  <div class="line"><Button class="button-setting" text="添加角色" @click="openNewWindow({ url: 'addRole', user: { } })"></Button></div>

  <table class="table-header">
    <thead>
      <th>角色名称</th>
      <th>描述</th>
      <th>操作</th>
    </thead>
    <tbody>
      <tr v-for="item in list">
        <td><span @click="openNewWindow({ url: 'editRole', user: { type: 'role', data: item } })">{{ item.name }}</span></td>
        <td>{{ item.description }}</td>
        <td><a href="javascript:;" style="color: #2277da" @click="del(item)">删除</a></td>
      </tr>
    </tbody>
  </table>
</div>
</template>

<script>
import Button from '../../../components/Button'
import { requestHandler } from '../../../services/index.js'

export default {
  components: {
    Button
  },
  data() {
    return {
      list: []
    }
  },
  ready() {
    requestHandler('getRoles', {}, (res) => {
      this.list = res.body.data;
    })
  },
  methods: {
    openNewWindow(obj) {
      this.$dispatch('open', obj.url, obj.user);
    },
    del(item) {
      const confirm = window.confirm(`确认删除角色 ${item.name} ?`)


      if (confirm) {
        const resource = this.$resource('/apis/role{/id}')

        resource.remove({
          id: item.id
        }).then((res) => {
          if (res.body.success) {
            this.$dispatch('Warning:dispatch', '删除成功', 'success');
            for (let i of this.list) {
              if (i.id === item.id) {
                this.list.splice(this.list.indexOf(i), 1);
              }
            }
          } else {
            this.$dispatch('Warning:dispatch', '删除失败', 'success');
          }
        })
      }

    }
  },
  events: {
    'reFetch'() {
      requestHandler('getRoles', {}, (res) => {
        this.list = res.body.data;
      })
    }
  }
}
</script>