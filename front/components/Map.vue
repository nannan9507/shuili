<template>
<div id="container" :class="{ 'big': rular === 'big', 'total': rular === 'total' }"></div>
</template>

<style lang="less">
#container {
  margin: 0 auto;
  height: 60%;
  max-width: 1200px;
  width: 100%;
}

#container.total {
  margin: 0 auto;
  width: 100%;
  height: 100%;
}

#container.big {
  margin: 0 auto;
  width: 100%;
  height: 80%;
  max-width: 1200px;
}

#container .box {
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: rgb(240, 246, 228);
  z-index: 100;
  cursor: default;
  min-width: 200px;
}

#container.big .box {
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: rgb(240, 246, 228);
  z-index: 100;
  cursor: default;
  min-width: 200px;
}

.info-box {
  background: #FFF;
  padding: 5px 5px 5px 0;
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 100;
  width: 285px;
  border: 1px solid #CCC;
  font-size: 14px;
  cursor: default;
  z-index: 200;
}

.info-box h2 {
  color: #999;
}

.info-box td {
  border-top: 1px solid #e7ecf1;
}

.info-title {
  text-align: left;
  padding-right: 40px;
}

.info-content {
  font-size: 12px;
  margin-top: 10px;
}

.station-detail {
  animation: bigger 1s;
  background: #FFF;
  padding: 5px;
  position: absolute;
  top: -1px;
  right: 290px;
  z-index: 100;
  width: 285px;
  border: 1px solid #CCC;
  font-size: 14px;
  cursor: default;
  z-index: 200;
  display: none;
}
.station-detail .content {
  display: none;
}

@keyframes bigger {
  from {
    width: 0px;
  }
  to {
    width: 285px;
  }
}

#left-tmp {
  position: absolute;
  top: 32px;
  left: 15px;
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%); 
}

.ie {
  #left-tmp {
    position: absolute;
    top: 30px;
    left: 15px;
    -webkit-transform: translate(-50%, -50%);
    -ms-transform: translate(-50%, -50%);
  }
}
</style>

<script>
import { requestHandler } from '../services/index.js'
import bling from '../images/bling.gif'
import AMap from 'AMap'
import $ from 'jquery'
import ztree from 'ztree'

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
     return y + '-' + m + '-' + d; 
  } else {
    return y + '-' + m + '-' + d+' '+h+':'+minute; 
  }
};  

export default {
  props: ['name', 'size'],
  data() {
    return {
      district: {},
      polygons: [],
      maps: [],
      map: {},
      list: [],
      item: {},
      rular: 'small',
      showBox: false,
      treeObj: {},
      station: {},
      temp: ''
    }
  },
  ready() {
    $('body').delegate('#close', 'click', () => {
      $('.info-box').hide();
    })
  },
  methods: {
    searchMap(obj) {
      //清除地图上所有覆盖物
      for (let i = 0; i < this.polygons.length; i++) {
        this.polygons[i].setMap(null);
      }

      this.district.setLevel(obj.level_type);
      this.district.setExtensions('all');

      this.district.search(obj.name, (status, result) => {
        new Promise((resolve, reject) => {
          resolve();
        }).then(() => {
          this.getData(result);
        }).then(() => {
          if (this.list && this.list.length > 0) {
            this.setMarker(this.list);
          }
        })
      })
    },
    setMarker(obj) {

      let icon = new AMap.Icon({
        size: new AMap.Size(32, 32),
        image: bling
      });

      if (this.list.length > 0) {
        for (let item of this.list) {

          if (item.station.coordinate) {
            let coordinate = item.station.coordinate.split(',');

            if (coordinate.length > 0) {
              for (let i = 0; i < coordinate.length; i++) {
                coordinate[i] = parseFloat(coordinate[i]);
              }

              item.position = [coordinate[0], coordinate[1]];

              
              const marker = new AMap.Marker({
                map: this.maps[this.name],
                position: [coordinate[0], coordinate[1]],
                icon: icon
              })

              // 监听事件
              AMap.event.addListener(marker, 'click', () => {
                $('.info-box').empty();

                this.setInfoWindow(item);
                this.setDataToSide(item.station);
              })
            }
          }

        }
      }
    },
    setInfoWindow(item) {
      const content = `
      <div class="info-title">
        ${ item.station.name }
      </div>
      `
      let infoWindow = new AMap.InfoWindow({
        content: content,
        offset: new AMap.Pixel(0, -30),
        closeWhenClickMap: true,
        autoMove: true
      });

      infoWindow.open(this.maps[this.name], item.position)
    },
    getData(e) {
      if (e.info === 'OK') {
        this.$dispatch('showMode');
        $('.box').show();
      }

      // 铺覆盖点
      const dList = e.districtList;
      for (let m = 0, ml = dList.length; m < ml; m++) {
        let data = e.districtList[m].level;
        let bounds = e.districtList[m].boundaries;

        if (bounds) {
          for (let i = 0, l = bounds.length; i < l; i++) {
            let polygon = new AMap.Polygon({
              map: this.maps[this.name],
              strokeWeight: 1,
              strokeColor: '#2277da',
              fillColor: '#CCF3FF',
              fillOpacity: 0.01,
              path: bounds[i]
            });
            this.polygons.push(polygon);
          }
        }
      }
    },
    setZtree(list) {
      var setting;
      var treeObj;

      new Promise((resolve, reject) => {
        resolve();
      }).then(() => {
        setting = {
          key: {
            name: 'name'
          },
          view: {
            dblClickExpand: false
          },
          data: {
            simpleData: {
              enable: true
            }
          },
          callback: {
            onClick: (event, treeId, treeNode, clickFlag) => {
              if (treeNode.is_station) {
                for (let item of this.list) {
                  if (item.station.id === treeNode.id) {
                    this.setInfoWindow(item);
                    this.setDataToSide(treeNode);
                  }
                }
              }
            }
          }
        };

        $.fn.zTree.init($('#tree'), setting, list);
        treeObj = $.fn.zTree.getZTreeObj('tree');

        const nodes = treeObj.getNodes();
        treeObj.expandNode(nodes[0], true, false, false);
      }).then(() => {
        if (this.list.length > 0) {
          this.setDataToSide(this.list[0].station);
          if (treeObj.getNodesByParam('id', this.list[0].station.id).length > 0) {
            const _node = treeObj.getNodesByParam('id', this.list[0].station.id)[0];
            treeObj.selectNode(_node);
          }

          setTimeout(() => {
            this.setInfoWindow(this.list[0]);
          }, 1000);
        }
      })

    },
    infoBox(flag, data, date) {
      if ($('.info-box')[0].innerHTML !== '') {
        $('.info-box').epmty();
      }
      const server = window.location.origin;

      let str = `
        <div style="float: right; font-size: 20px; margin-top: 5px; margin-right: 10px; cursor: pointer;" id="close">×</div>
        <label style="cursor: pointer; user-select: none;" id="stationDetail">
          <div style="float: left; font-size: 16px; color: #777; font-weight: 700; margin: 5px 15px 10px 25px; padding-top: 10px;">${this.station.name}</div> 
          <div id="left-tmp">《</div>
        </label>
        <div class="station-detail">
          <div class="content">
            <table style="width: 80%; margin: 10px auto;">
              <tr>
                <td>测站编码</td>
                <td>${this.station.station_code || ''}</td>
              </tr>
              <tr>
                <td>行政区划</td>
                <td>${this.station.org_name || ''}</td>
              </tr>
              <tr>
                <td>站点坐标</td>
                <td>${this.station.coordinate || ''}</td>
              </tr>
              <tr>
                <td>测站描述</td>
                <td>${this.station.description || ''}</td>
              </tr>
            </table>
          </div>

          <center>
            <img id="station-pic" src="${server}/api/image/${this.station.image || '_error_'}" width="250px" height="250px" />
          </center>
        </div>
      `;

      str += `
      <table style="width: 80%; margin: 10px auto;">
        <thead>
          <th style="text-align: left;">因子项</th>
          <th style="text-align: left;">测量值</th>
          <th style="text-align: left;">预警</th>
        </thead>
      `

      if (flag) {
        for (let i in data.now) {
          let factor = data.now[i];
          if (factor.selected) {
            str += 
            `<tr>
              <td style="padding: 8px 8px 8px 0;">${factor.name}</td>
              <td style="padding: 8px 8px 8px 0;">${factor.value} ${factor.m_unit}</td>
              <td style="padding: 8px 8px 8px 0;">${factor.alarmed === true ? '是' : '否'}</td>
            </tr>
            `
          }
        }
      } else {
        str += `</table>`
      }

      $('.info-box').append(str);
      $('.info-box').show();
    },
    setDataToSide(station) {
      const resource = this.$resource('/apis/data/stations{/id}/map')

      resource.get({
        id: station.id
      }).then((res) => {
        const server = window.location.origin;

        this.getStation(station.id, res.body.data);
      })
    },
    getStation(id, data) {
      let date;
      if (data && data.datatime) {
        date = formatDateTime(new Date(data.datatime));
      }

      const resource = this.$resource('/apis/station/stations{/id}');

      return resource.get({
        id: id
      }).then(function (cb) {
        if (cb.body.success) {
          this.station = cb.body.data;

          if (data && data.datatime) {
            this.infoBox(1, data, date);
          } else {
            this.infoBox();
          }

          if ($('#station-pic')[0].src.indexOf('_error_') > -1) {
            $('#station-pic').hide();
          }

          $('#stationDetail').click(() => {
            $('.station-detail').show();
            setTimeout(() => {

              $('.station-detail .content').show();
            }, 1000);
          });
        }
      })
      

    },
    blockup(flag) {
      if (flag) {
        this.$dispatch('openMask', true);
        window.plotly_timer = setTimeout(() => {
          this.$dispatch('Warning:dispatch', '加载超时, 请稍后重试', 'fail');
          this.$dispatch('closeMask');
        }, 1000 * 10);
      } else {
        clearTimeout(window.plotly_timer);
        this.$dispatch('closeMask');
      }
    }
  },
  events: {
    'mapCalled'(options, obj, size, isMap) {
    
      this.maps[this.name] = new AMap.Map('container', {
        view : new AMap.View2D({
          center: [parseFloat(options.longitude), parseFloat(options.latitude)],
          zoom: parseInt(options.level_type) + 6,
          resizeEnable: false
        }),
        features : ['bg', 'point']
      });

      if (size) {
        this.rular = size;
      }

      var opts = {
        subdistrict: 1,   //返回下一级行政区
        extensions: 'all',  //返回行政区边界坐标组等具体信息
        level: 'city'  //查询行政级别为 市
      };

      this.district = new AMap.DistrictSearch();

      if (Array.isArray(obj)) {
        this.list = obj;
      }

      this.searchMap(options);

      if (isMap) {
        $('#container').append(
          `<div class="box" style="display: none;">
            <ul id="tree" class="ztree"></ul>
          </div>
          <div class="info-box" style="display: none;"></div>`
        );
      }

      requestHandler('getOrgTree', {}, (res) => {
        if (res.body.data.length > 0) {
          this.setZtree(res.body.data);
        }
      })
    }
  }
}
</script>