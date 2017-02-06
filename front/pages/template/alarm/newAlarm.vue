<template>
<div class="new-alarm">
  <header>
    <label @click="hideAddWindow"><i class="iconfont icon-iconback"></i>返回</label>
    <h2>新增告警策略</h2>
  </header>

  <table class="table-form">
    <tr>
      <td class="title">策略名称</td>
      <td><input type="text" v-model="name"/></td>
    </tr>
    <tr>
      <td class="title">策略类型</td>
      <td>
        <label class="radio-base">
          <input type="radio" class="radio" name="type" value="1" v-model="type" @click="toggleType(1)" Number/>
          <span>阈值告警</span>
        </label>

        <label class="radio-base">
          <input type="radio" class="radio" name="type" value="2" v-model="type" @click="toggleType(2)" Number/>
          <span>关联告警</span>
        </label>
      </td>
    </tr>
  </table>

  <h4>告警触发条件</h4>

  <table class="table-header" v-show="type === 1">
    <thead>
      <th style="width: 30%">因子</th>
      <th style="width: 50%">阈值</th>
      <th>操作</th>
    </thead>
    <tbody>

      <tr v-for="item in line" track-by="$index">
        <td>
          <select v-model="item.factor" @click="choiceFactor(item)">
            <option v-for="fac in factors" :value="fac">{{ fac.name }}</option>
          </select>
          <select v-model="item.fired_symbol">
            <option value="1" selected>&gt;</option>
            <option value="2">&gt;=</option>
            <option value="3">&lt;</option>
            <option value="4">&lt;=</option>
          </select>
        </td>

        <td>
          <input type="text" v-model="item.limitSide" /> 

          <b style="font-weight: normal;" v-if="item.factor.name">{{ item.factor.m_unit }}</b>
        </td>

        <td>
          <span class="btn" @click="delRule($index)">删除</span>
        </td>
      </tr>

    </tbody>
  </table>

  <table class="table-header" v-show="type === 2">
    <thead>
      <th>因子A</th>
      <th>因子B</th>
      <th>操作</th>
    </thead>
    <tbody>
      <tr v-for="item in line" track-by="$index">
        <td>
          <select v-model="item.factor" @click="choiceFactor(item)">
            <option v-for="fac in factors" :value="fac">{{ fac.name }}</option>
          </select>
          <select v-model="item.fired_symbol">
            <option value="1" selected>&gt;</option>
            <option value="2">&gt;=</option>
            <option value="3">&lt;</option>
            <option value="4">&lt;=</option>
          </select>
        </td>

        <td>
          <input type="text" v-model="item.multiple"/>
          
          <span class="unit">倍</span>

          <select v-model="item.otherFactor" @click="choiceOtherFactor(item)">
            <option v-for="fac in factors" :value="fac">{{ fac.name }}</option>
          </select>
        </td>

        <td>
          <span class="btn" @click="delRule($index)">删除</span>
        </td>
      </tr>
    </tbody>
  </table>

  <div class="line add" v-show="showAddBtn"><span @click="addRule">+ 新增规则</span></div>

  <button style="margin-top:30px;" class="button-setting-big" @click="signup()">完成</button>
</div>
</template>

<script>
import jquery from 'jquery'
import { requestHandler } from '../../../services/index.js'

export default {
  data() {
    return {
      showAddBtn: false,
      factors: [],
      line: [],
      name: '',
      type: ''
    }
  },
  ready() {
    requestHandler('getChoiceFactor', {}, (res) => {
      this.showAddBtn = true;
      if (res.body.data && res.body.data.length > 0) {
        this.factors = res.body.data;
      }
    })
  },
  methods: {
    hideAddWindow() {
      this.$dispatch('hide');
    },
    addRule() {
      let alarm = {
        factor: {},
      }
      this.line.push(alarm);
    },
    toggleType(type) {
      if (type !== this.type) {
        this.line = [];
      }
    },
    delRule(index) {
      this.line.splice(index, 1);
    },
    choiceFactor(item) {
      item.fired_factor_id = item.factor.id;
    },
    choiceOtherFactor(item) {
      item.associated_factor_id = item.otherFactor.id;
    },
    signup() {
      requestHandler('addAlarm', {
        data: {
          name: this.name,
          type: this.type,
          conditions: JSON.stringify(this.line)
        }
      }, (res) => {
        if (res.body.success) {
          this.$dispatch('Warning:dispatch', '添加成功', 'success');
          this.line = [];
          this.name = '';
          this.type = 1;
        } else {
          this.$dispatch('Warning:dispatch', res.body.message, 'fail');
        }
      })
    }
  },
  events: {
    'setType'() {
      this.type = 1;
      $('.radio')[0].checked = true;
    }
  }
}
</script>

<style scoped>
select {
  margin-top: 0;
  padding: 0;
}
</style>