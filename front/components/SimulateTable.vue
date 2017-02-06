<script>
import server from '../../server/configs/server.js'
// 51: <th v-for="item in thead_add">{{ item.name }}</th>
// 54: <td v-for="i in station.list">{{ i.value || '/' }} <span v-show="i.value && i.value !== '-'">{{ i.m_unit }}</span></td>
// 60: <td v-for="j in i.data">{{ j.value }} <span v-show="j.value >= 0 && j.value !== '-'">{{ j.m_unit }}</span></td>
var formatDateTime = function (date, type) {  
  var y = date.getFullYear();  
  var m = date.getMonth() + 1;  
  m = m < 10 ? ('0' + m) : m;  
  var d = date.getDate();  
  d = d < 10 ? ('0' + d) : d;
  var h = date.getHours();
  h = h < 10 ? ('0' + h) : h;  
  var minute = date.getMinutes();  
  minute = minute < 10 ? ('0' + minute) : minute;

  if (type === 1) {
    return y + '-' + m + '-' + d+' '+h+':'+minute;
  } else if (type === 3) {
    return y + '-' + m;
  } else if (type === 2) {
    return y + '-' + m + '-' + d;
  }
};  

export default {
  template: `
<div class="table-container">
    <div class="headcol">
        <table class="left">
            <thead class="left-thead">
              <th v-for="name in thead_common" v-if="table_style === 'multi'">{{ name }}</th>
              <th v-if="table_style === 'single'" v-show="list && list.length > 0">时间</th>
            </thead>
            <tbody class="left-tbody" v-if="table_style === 'multi'">
                <tr v-for="item in stations">
                    <td>{{ $index + 1 }}</td>
                    <td><div class="icon" :class="{ 'connection': item.station.connected, 'disconnection': !item.station.connected }"></div></td>
                    <td><span @click="jump('station', item.station)" style="cursor: pointer;color: #2277da;">{{ item.station.name }}</span></td>
                    <td><a style="cursor: pointer;color: #2277da;" href="javascript:;" @click="jump('data-history', item.station)">{{ item.station.time }}</a></td>
                </tr>
            </tbody>
            <tbody v-if="table_style === 'single'">
              <tr v-for="i in list">
                <td>{{ i.name }}</td>
              </tr>
            </tbody>
        </table>
    </div>
    <div class="right">
        <table>
            <thead>
              <th v-for="item in thead_add">{{ item.name }}<span v-show="item.m_unit">({{ item.m_unit }})</span></th>
            </thead>
            <tbody v-if="table_style === 'multi'">
              <tr v-for="station in stations">
                <td v-for="i in station.list">{{ i.value || '/' }}</td>
              </tr>
            </tbody>
            <tbody v-if="table_style === 'single'" >
              <tr v-for="i in list">
                <td v-for="j in i.data">{{ j.value }}</td>
              </tr>
            </tbody>
        </table>
    </div>
</div>

  `,
  data() {
    return {
      table_style: '',
      thead_common: [],
      thead_add: [],
      stations: [],
      items: {},
      list: []
    }
  },
  methods: {
    jump(url, station) {
      sessionStorage.setItem('flag', 1);
      sessionStorage.setItem('pre_station', JSON.stringify(station));
      // this.$router.go(url);]
      this.$nextTick(() => {
        window.open(window.location.href+url);
      })
    },
  },
  events: {
    'SimulateTimeline'(item, type) {
      this.list = [];
      this.thead_add = [];

      this.table_style = 'single';
      let factors = {};
      let list = [];
      let _list = [];

      for (let i in item) {
        list[i] = { name: formatDateTime(new Date(i), type), data: [] }
        for (let j in item[i]) {
          if (!factors[j]) {
            factors[j] = { name: item[i][j].name, db_field: item[i][j].db_field, m_unit: item[i][j].m_unit };
          }

          if (item[i][j].value) {
            list[i].data.push({ value: item[i][j].value, m_unit: item[i][j].m_unit })
          } else {
            if (item[i][j].value === 0) {
              list[i].data.push({ value: 0, m_unit: item[i][j].m_unit })
            } else {
              list[i].data.push({ value: '-', m_unit: item[i][j].m_unit })
            }
          }
        }
      }

      // obj => array
      for (let i in factors) {
        this.thead_add.push(factors[i]);
      }

      for (let i in list) {
        _list.push(list[i]);
      }

      this.list = _list;

      this.$nextTick(() => {
        $('.table-container tr').on('mouseover', function () {
          const index = $(this).index();

          $($('.left tbody tr')[index]).addClass('hover-action');
          $($('.right tbody tr')[index]).addClass('hover-action');
        })

        $('.table-container tr').on('mouseout', function () {
          const index = $(this).index();
          
          $($('.left tbody tr')[index]).removeClass('hover-action');
          $($('.right tbody tr')[index]).removeClass('hover-action');
        })
      })
    },
    'simulateSingle'(item) {
      this.table_style = 'single';
      this.thead_common = item.thead.th_1;
      this.thead_add = item.thead.th_2;

      let list = [
        {
          name: '最新数据',
          id: 'now',
          data: []
        },
        {
          name: '日均值',
          id: 'today',
          data: []
        },
        {
          name: '周均值',
          id: 'week',
          data: []
        },
        {
          name: '月均值',
          id: 'month',
          data: []
        }
      ];

      this.list = list;


      // 获取站点因子
      for (let i = 0; i < this.thead_add.length; i++) {
        const unit = this.thead_add[i];
        this.items[unit.db_field] = {
          id: i,
          name: unit.db_field,
          m_unit: unit.m_unit
        }
      }


      // 如果list 是now 循环到也是now 则推进list.data
      for (let flag = 0; flag < this.list.length; flag++) {

        for (let i in item) {
          if (this.list[flag].id === i) {
            for (let j in this.items) {
              let _item = {};
              if (item[i][j]) {
                if (item[i][j].value) {
                  _item = { value: item[i][j].value }
                } else if (item[i][j].value === 0) {
                  _item = { value: 0 }
                } else {
                  _item = { value: '-' }
                }
              }

              list[flag].data.push(_item)
            }
          }
        }
      }

      // jquery
      this.$nextTick(() => {
        $('.table-container tr').on('mouseover', function () {
          const index = $(this).index();

          $($('.left tbody tr')[index]).addClass('hover-action');
          $($('.right tbody tr')[index]).addClass('hover-action');
        })

        $('.table-container tr').on('mouseout', function () {
          const index = $(this).index();
          
          $($('.left tbody tr')[index]).removeClass('hover-action');
          $($('.right tbody tr')[index]).removeClass('hover-action');
        })
      })

    },
    'simulateMulti'(item) {
      this.table_style = 'multi';
      this.thead_common = item.thead.th_1;
      this.thead_add = item.thead.th_2;
      this.stations = item.stations;

      // 设置items
      for (let i = 0; i < this.thead_add.length; i++) {
        const unit = this.thead_add[i];
        this.items[unit.db_field] = {
          id: i,
          name: unit.db_field,
          m_unit: unit.m_unit
        }
      }

      for (let station of this.stations) {
        let list = [];

        if (station.history && station.history.history_json) {
          // 更新时间
          station.station.time = formatDateTime(new Date(station.history.datatime), 1);

          // 总因子
          for (let i in this.items) {
            let _item;
            // 站点因子
            
            for (let j in station.history.history_json) {
              // 总因子有且站点也有且站点因子打开, 合并
              if (i === j && station.history.history_json[j].selected) {
                _item = {...this.items[i]};
                _item.value = station.history.history_json[j].value;
                // _item.m_unit = 
                // 如果没获得因子数据，显示-
                if (_item.value === undefined || _item.value === null) {
                  _item.value = '-';
                } else if (_item.value === 0) {
                  _item.value = '0';
                }
                break;
              }
            }

            if(_item) {
              list.push(_item);
            } else {
              list.push(this.items[i]);
            }

          }
        } else { // 当history不存在的情况
          for (let i in this.items) {
            list.push(this.items[i]);
          }
        }

        station.list = list;
        // break;
      }

      // jquery
      this.$nextTick(() => {
        $('.table-container tr').on('mouseover', function () {
          const index = $(this).index();

          $($('.left tbody tr')[index]).addClass('hover-action');
          $($('.right tbody tr')[index]).addClass('hover-action');
        })

        $('.table-container tr').on('mouseout', function () {
          const index = $(this).index();

          $($('.left tbody tr')[index]).removeClass('hover-action');
          $($('.right tbody tr')[index]).removeClass('hover-action');
        })
      })

    },
    'clear'() {
      this.thead_common = [];
      this.thead_add = [];
      this.list = []
    }
  }
}
</script>