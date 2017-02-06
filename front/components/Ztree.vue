<script>
import $ from 'jquery'
import ztree from 'ztree'

function nodeOnClick(node) {
  console.log(node)
}

function openExistNodeByParams(treeObj, params) {
  let node = treeObj.getNodeByParam(params.key, params.value);
  treeObj.selectNode(node);
  treeObj.setting.callback.onClick(null, null, node);
}

function hideUnexistNodes(treeObj) {
  // var nodes = treeObj.getNodes();
  // treeObj.removeNode(nodes[0])
}


// function showMenu() {
//   var cityObj = $("#citySel");
//   var cityOffset = $("#citySel").offset();

//   $("#menuContent").css({ left:cityOffset.left + "px", top: cityOffset.top-30 + "px", background: '#f0f6e4', overflowY: 'scroll', border: '1px solid #617775' }).slideDown("fast");

//   $("body").bind("mousedown", onBodyDown);
// }

// function hideMenu() {
//   $("#menuContent").fadeOut("fast");
//   $("body").unbind("mousedown", onBodyDown);
// }

// function onBodyDown(event) {
//   if (!(event.target.id == "menuBtn" || event.target.id == "menuContent" || $(event.target).parents("#menuContent").length>0)) {
//     hideMenu();
//   }
// }

export default {
  props: {
    list: {
      type: Array,
      required: false,
      default() {
        return [];
      }
    },
    name: {
      type: String,
      required: true,
      default() {
        return '';
      }
    },
    type: {
      type: String,
      required: false,
      default() {
        return 'tree';
      }
    }
  },
  data() {
    return {
      nodes: {},
      treeObj: {},
      station_name: ''
    }
  },
  watch: {
    'station_name'(current, old) {
      this.$dispatch('getNewStation', current);
    }
  },
  methods: {
    getFirst(treeObj) {
      const nodes = treeObj.getNodes();
      if (nodes.length > 0) {
        treeObj.expandNode(nodes[0]);
      }
    },
    choice() {
      this.showMenu();
    },
    showMenu() {
      this.$nextTick(() => {
        const cityObj = $("#"+this.name+"-citySel");
        const cityOffset = $("#"+this.name+"-citySel").offset();

        $("#"+ this.name +"-menuContent").css({ left:cityOffset.left + "px", top: cityOffset.top-30 + "px", background: '#f0f6e4', overflowY: 'scroll', border: '1px solid #617775', zIndex: '2000' }).slideDown("fast");

        $("body").bind("mousedown", this.onBodyDown);
      })
    },
    hideMenu() {
      $("#"+ this.name +"-menuContent").fadeOut("fast");
      $("body").unbind("mousedown", this.onBodyDown);
    },
    onBodyDown(event) {
      if (!(event.target.id == this.name+"menuBtn" || event.target.id == this.name + "-menuContent" || $(event.target).parents("#"+ this.name +"-menuContent").length>0)) {
        this.hideMenu();
      }
    }
  },
  template: `
  <div class="tree-box">
    <ul id="tree-{{ name }}" class="ztree" v-if="type === 'tree'"></ul>

    <div v-if="type === 'select'">
      <input readonly id="{{ name }}-citySel" value="{{ station_name }}" style="width: 140px; height: 1.4375rem; padding: 0.3125rem 0.625rem; border: 0.0625rem solid #d1d2d3; border-radius: 2px;" />
      <span id="{{ name }}menuBtn" style="margin-left: 6px; color: #2277da; font-size: 12px; cursor: pointer;" @click="choice">选择</span>
      <div id="{{ name }}-menuContent" class="menuContent" style="display: none; position: absolute;">
        <ul id="tree-{{ name }}" class="ztree teshu" style="width:120px; height: 300px;"></ul>
      </div>
    </div>

    <div v-if="type === 'station-select'">
      <input readonly id="{{ name }}-citySel" value="站点选择" style="width: 140px; height: 1.4375rem; padding: 0.3125rem 0.625rem; border: 0.0625rem solid #d1d2d3; border-radius: 2px; cursor: pointer;" @click="choice" />
      <div id="{{ name }}-menuContent" class="menuContent" style="display: none; position: absolute;">
        <ul id="tree-{{ name }}" class="ztree teshu" style="width:120px; height: 300px;"></ul>
      </div>
    </div>

    <div v-if="type === 'checkbox'">
      <ul id="tree-{{ name }}" class="ztree"></ul>
    </div>
  </div>
  `,
  events: {
    'createZtree'(list) {
      this.station_name = '';
      // 如果有url就去除
      if (this.type === 'checkbox') {
        if (list && list.length > 0) {
          for (let i = 0; i < list.length; i++) {
            if (list[i].url) {
              list[i].url = '';
            }
          }
        }
      }

      this.treeObj = {};

      var setting = {
        key: {
          name: 'tname'
        },
        view: {
          dblClickExpand: true,
          showIcon: this.icon
        },
        data: {
          simpleData: {
            enable: true
          }
        },
        check: {
          enable: this.type === 'checkbox' ? true : false
        },
        callback: {
          beforeClick: (treeId, treeNode) => {
            if (this.type === 'select') {
              if (treeNode.isParent === true && treeNode.children.length > 0) {
                let treeObj = $.fn.zTree.getZTreeObj(treeId);
                treeObj.expandNode(treeNode);
              }
            }
          },
          onClick: (event, treeId, treeNode, clickFlag) => {
            if (this.type === 'tree') {
              this.$dispatch('getNode', treeNode);
            } else if (this.type === 'select') {
              if (!treeNode.parentTId) {
                return;
              }

              if (treeNode.isParent === true) {
                this.station_name = treeNode.children[0].name;
                this.$dispatch('getOrgId', treeNode.children[0].id);
              } else {
                this.station_name = treeNode.name;
                this.$dispatch('getOrgId', treeNode.id);
              }
            } else if (this.type === 'station-select') {
              if (treeNode.pId === null) {
                this.$dispatch('top');
              }

              if (treeNode.is_station) {
                this.$dispatch('nodeToStation', treeNode);
              }
            }

            // 如果为文件夹形式子元素不为空
            // if (treeNode.isParent === true && treeNode.children.length > 0) {
            //   let treeObj = $.fn.zTree.getZTreeObj(treeId);
            //   treeObj.expandNode(treeNode);
            // } else {
            // }
          },
          onCheck: (event, treeId, treeNode) => {
            this.$dispatch('checkNode', treeNode, this.name);
          }
        }
      };

      this.$nextTick(() => {
        this.nodes = list;

        this.$nextTick(function () {
          $.fn.zTree.init($('#tree-'+this.name), setting, this.nodes);
          this.treeObj = $.fn.zTree.getZTreeObj('tree-'+this.name);
          this.$dispatch('getNode', this.treeObj.getNodes()[0]);
          
          // if (this.type !== 'checkbox') {
            this.getFirst(this.treeObj);
          // }
        })
      })
    },
    'updateZtree'(node) {
      const _node = this.treeObj.getSelectedNodes()[0];

      _node.tname = node.tname;
      _node.name = node.tname + '(' + node.userCount + ')';

      this.treeObj.updateNode(_node);
    },
    'addZtree'(parentNode, node) {
      this.treeObj.addNodes(parentNode, node);
    },
    'removeZtree'(node) {
      this.treeObj.removeNode(node);
      this.$dispatch('getNode', this.treeObj.getNodes()[0]);
    },
    'setInputValue'(station) {
      this.$nextTick(() => {
        this.station_name = station.org_name;
      })
    },
    'getAllCheckedNodes'() {
      this.$nextTick(() => {
        const list = this.treeObj.getCheckedNodes(true);
        this.$dispatch('getCheckList', list, this.name);
      })
    },
    'getParamsNode'(obj) {
      const params = {
        key: 'id',
        value: obj.id
      }

      this.$watch('treeObj', () => {
        const node = this.treeObj.getNodeByParam(params.key, params.value);
        this.$dispatch('nodeToStation', node);
      })
    },
    'lockAllNodes'() {
      const nodes = this.treeObj.getNodes();
      for (let node of nodes) {
        this.treeObj.setChkDisabled(node, true, true, true);
      }
    },
    'unlockNodes'() {
      const nodes = this.treeObj.getNodes();
      for (let node of nodes) {
        this.treeObj.setChkDisabled(node, false, true, true);
      }
    },
    // 'openNode'() {
    //   // 需要两次$nextTick
    //   this.$nextTick(() => {

    //   })
    // }
  }
}
</script>

<style scoped>
@import '../styles/zTreeStyle.css';

.tree-box {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: #CCC;
  padding-right: 1em;
}

.ztree {
  font-size: 14px!important;
}
</style>