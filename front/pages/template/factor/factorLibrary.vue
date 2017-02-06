<template>
<div class="factor-library"> 
  <div class="input-box">
    <input type="text" @input="search($event)" placeholder="输入因子名称查询" />
    <ul>
      <li>输入因子名称查询，如果查询不到，请联系更新因子母库；</li>
    </ul>
  </div>

  <div class="table-box">
    <div class="left-box">
      <div class="header">查询结果</div>
      <table class="table-header">
        <thead>
          <th>因子名称</th>
          <th>单位</th>
          <th>操作</th>
        </thead>
        <tbody>
          <tr v-for="item in server_list">
            <td>{{ item.name }}</td>
            <td>{{ item.m_unit }}</td>
            <td><Button class="button-action" text="添加" @click="add(item, $index)" :disabled="item.selected"></Button></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="right-box">
      <div class="header">已选因子 <span style="color: #999;">(拖动以调整显示因子顺序)</span></div>
      <table class="table-header">
        <thead>
          <th>因子名称</th>
          <th>单位</th>
          <th>操作</th>
        </thead>
        <tbody>
          <tr v-for="item in choice_list" id="{{ $index }}"
            v-drag-and-drop
            drag-start="handleDragStart"
            drag-over="handleDragOver"
            drag-enter="handleDragEnter"
            drag-leave="handleDragLeave"
            drag-end="handleDragEnd"
            drop="handleDrop"
            drag="handleDrag">
            <td>{{ item.name }}</td>
            <td>{{ item.m_unit }}</td>
            <td><span @click="remove($index)">移除</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

</div>
</template>

<script>
import $ from 'jquery'
import { requestHandler } from '../../../services/index.js'
import Button from '../../../components/Button'
import '../../../services/vue.drag-and-drop.js'

export default {
  components: {
    Button,
  },
  data() {
    return {
      server_list: [],
      choice_list: [],
      loggedEvent: ''
    }
  },
  ready() {
    this.choiceList();
  },
  methods: {
    search(event) {
      if (event) {
        this.search_txt = event.target.value;
      }
      // 每次查询清空
      this.server_list = [];

      requestHandler('getFactor', {
        query: { 'q': this.search_txt }
      }, (cb) => {
        if (cb.body.data && cb.body.data.length > 0) {
          for (let i = 0; i < cb.body.data.length; i++) {
            this.server_list.splice(i, 0, cb.body.data[i]);
          }
        }
      })
    },
    choiceList() {
      this.choice_list = [];
      requestHandler('getChoiceFactor', {}, (cb) => {
        if (cb.body.data && cb.body.data.length > 0) {
          for (let i = 0; i < cb.body.data.length; i++) {
            this.choice_list.splice(i, 0, cb.body.data[i]);
          }
        }
      })
    },
    add(item, index) {
      const _item = Object.assign({}, item);
      _item.selected = true;
      this.server_list.splice(index, 1, _item);
      // this.$set('item', _item);

      let list = [];

      let flag = { id: item.id, exist: false };
      for (let i in this.choice_list) {
        list.push(this.choice_list[i].id);
        if (parseInt(this.choice_list[i].id) === parseInt(item.id)) {
          flag.exist = true;
        }
      }

      if (!flag.exist) {
        this.choice_list.push(item);
        list.push(flag.id);
      }

      this.updateList(list);
    },
    updateList(list) {
      requestHandler('addFactor', {
        data: { list: list }
      }, (res) => {
        
      })
    },
    remove(index) {
      this.choice_list.splice(index, 1);
      const list = [];
      for (let item of this.choice_list) {
        list.push(item.id);
      }
      this.updateList(list);

      this.search();
    },
    handleDragStart: function(elem) {
      this.loggedEvent = 'handleDragStart';
    },
    handleDragOver: function(elem) {
      this.loggedEvent = 'handleDragOver';
    },
    handleDrag: function(elem) {
      this.loggedEvent = 'handleDrag';
    },
    handleDragEnter: function(elem) {
      this.loggedEvent = 'handleDragEnter';
    },
    handleDragLeave: function(elem) {
      this.loggedEvent = 'handleDragLeave';
    },
    handleDragEnd: function(elem) {
      this.loggedEvent = 'handleDragEnd';
    },
    handleDrop: function(itemOne, itemTwo) {
      const src_index = parseInt(itemOne.id);
      const target_index = parseInt(itemTwo.parentElement.id);

      const dummy = this.choice_list[src_index];
      
      this.choice_list.splice(src_index, 1);
      this.choice_list.splice(target_index, 0, Object.assign({}, dummy));

      const list = [];
      for (let item of this.choice_list) {
        list.push(item.id);
      }

      this.updateList(list);
    }
  }
}
</script>