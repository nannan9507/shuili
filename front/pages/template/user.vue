<template>
<div class="user-box" v-show="!newPage.ready">
  <header>
    <nav-select></nav-select>
  </header>

  <user-manager v-show=" type_selector === '用户管理' "></user-manager>
  <role-manager v-show=" type_selector === '角色管理' "></role-manager>
</div>

<user-add v-show="newPage.ready && newPage.type === 'addUser' "></user-add>
<role-add v-show="newPage.ready && newPage.type === 'addRole' "></role-add>

<user-edit v-show="newPage.ready && newPage.type === 'editUser' "></user-edit>
<role-edit v-show="newPage.ready && newPage.type === 'editRole' "></role-edit>

</template>

<script>
import NavSelect from '../../components/NavSelect'

import userManager from './user/userManager'
import roleManager from './user/roleManager'
import userAdd from './user/userAdd'
import roleAdd from './user/roleAdd'
import userEdit from './user/userEdit'
import roleEdit from './user/roleEdit'

export default {
  components: {
    NavSelect,
    userManager,
    roleManager,
    userAdd,
    roleAdd,
    userEdit,
    roleEdit
  },
  data() {
    return {
      newPage: {
        ready: false,
        type: ''
        // ready: true,
        // type: 'eidtUser'
      },
      type_selector: ''
    }
  },
  events: {
    type(name) {
      this.type_selector = name;
    },
    back() {
      this.newPage.ready = false;
      this.type = '';
      this.$broadcast('reFetch');
    },
    open(type, user) {
      this.newPage.ready = true;
      this.newPage.type = type;
      if (user && user.type === 'user') {
        this.$broadcast('recieveUser', user);
        this.$broadcast('reset');
      } else {
        if (user && user.type === 'role') {
          this.$broadcast('recieveRole', user);
        } else {
          this.$broadcast('role_restart');
        }
      }
    }
  }
}
</script>