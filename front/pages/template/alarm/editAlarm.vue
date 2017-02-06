<template>
<div class="new-alarm">
  <header>
    <label @click="hideAddWindow"><i class="iconfont icon-iconback"></i>返回</label>
    <h2>修改告警策略</h2>
  </header>

  <table class="table-form">
    <tr>
      <td class="title">策略名称</td>
      <td><input type="text" v-model="name" /></td>
    </tr>
    <tr>
      <td class="title">策略类型</td>
      <td>
        {{ type === 1 ? '阈值告警' : '关联告警' }}
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
          <select v-model="item.factor" @click="choiceFactor(item, $index)">
            <option v-for="fac in factors" :value="fac">{{ fac.name }}</option>
          </select>
          <select v-model="item.fired_symbol">
            <option value="1">&gt;</option>
            <option value="2">&gt;=</option>
            <option value="3">&lt;</option>
            <option value="4">&lt;=</option>
          </select>
        </td>

        <td style="line-height: 1.7rem;">
          <input type="text" v-model="item.limitSide" />

          <b class="m_unit" style="font-weight: normal;" v-if="item.factor.name">{{ item.factor.m_unit }}</b>
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
            <option value="1">&gt;</option>
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

  <div class="line add"><span @click="addRule">+ 新增规则</span></div>

  <button style="margin-top: 30px;" class="button-setting-big" @click="signup()">保存</button>
  <button style="margin-top: 30px; float: right; background: rgb(255, 129, 129); border: none;" class="button-setting-big" @click="del()">删除</button>
</div>
</template>

<script>
import Vue from 'vue'
import jquery from 'jquery'
import { requestHandler } from '../../../services/index.js'

export default {
  data() {
    return {
      factors: [],
      line: [],
      name: '',
      type: '',
      id: ''
    }
  },
  ready() {
    requestHandler('getChoiceFactor', {}, (res) => {
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
        otherFactor: {},
        fired_symbol: '1'
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
    choiceFactor(item, index) {
      item.fired_factor_id = item.factor.id;

      // 关联告警没有index
      if (index >= 0) {
        if ($('.m_unit')[index] && ($('.m_unit')[index].innerHTML || $('.m_unit')[index].innerHTML === "")) {
          $('.m_unit')[index].innerHTML = item.factor.m_unit;
        }
      }
    },
    choiceOtherFactor(item) {
      item.associated_factor_id = item.otherFactor.id;
    },
    signup() {
      requestHandler('updateAlarm', {
        data: {
          id: this.id,
          name: this.name,
          type: this.type,
          conditions: JSON.stringify(this.line)
        }
      }, (res) => {
        if (res.body.success) {
          this.$dispatch('Warning:dispatch', '更新成功', 'success');
        } else {
          this.$dispatch('Warning:dispatch', res.body.message, 'fail');
        }
      })
    },
    del() {
      const resource2 = this.$resource('/apis/alarm{/id}');
      return resource2.delete({
        id: this.id
      }).then(function (cb) {
        if (cb.body.success) {
          this.$dispatch('Warning:dispatch', '删除成功', 'success');
          this.hideAddWindow();
        }
      })
    }
  },
  events: {
    'getData'(alarm) {
      this.name = alarm.name;
      this.type = alarm.type;
      this.id = alarm.id;

      // Promise
      const factorPromise = (ready) => {
        return new Promise((resolve, reject) => {
          resolve();
        })
      }

      factorPromise().then(() => {
        requestHandler('getChoiceFactor', {}, (res) => {
          if (res.body.data && res.body.data.length > 0) {
            this.factors = res.body.data;
          }
        })
      }).then(() => {
        const resource = this.$resource('/apis/alarm{/id}');
        resource.get({
          id: alarm.id
        }).then(function (res) {
          if (res.body.data) {
            this.line = res.body.data.conditions;

            for (let i = 0; i < this.line.length; i++) {
              const item = this.line[i];

              for (let j = 0; j < this.factors.length; j++) {
                if (item.fired_factor_id === this.factors[j].id) {
                  item.factor = this.factors[j];
                }

                if (item.associated_factor_id === this.factors[j].id) {
                  item.otherFactor = this.factors[j];
                }
              }
            }
          }
        })
      })

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