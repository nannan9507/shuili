<style lang="less">
.pagination-con ul {
  float: left;
  margin-left: 1px;
}

select {
  float: left;
  padding: 10px;
  margin-left: 10px;
  margin-top: 21px;
  background: #FFF;
  border: 1px solid #CCC;
}

.position {
  overflow: hidden;
}
</style>

<template>
  <div class="position">
    <vue-pagination :pagination-config.sync="config"></vue-pagination>
    <select v-model="config.itemsPerPage" @change="changePer(config.itemsPerPage)" v-show="this.list.length > 0">
      <option value="15">显示15条/页</option>
      <option value="20">显示20条/页</option>
      <option value="25" selected>显示25条/页</option>
      <option value="35">显示35条/页</option>
    </select>
  </div>
</template>

<script>
export default {
  data() {
    return {
      list: [],
      config: {
        prevStr: '上一页',
        nextStr: '下一页',
        lastStr: '末页',
        firstStr: '首页',
        currentPage: 1,
        itemsPerPage: 0,
        pagesLength: 0,
        totalItems: 0,
        onChange() {}
      }
    }
  },
  ready() {
    this.config.onChange = () => {
      const start = (this.config.currentPage-1) * this.config.itemsPerPage;
      const end = start + parseInt(this.config.itemsPerPage);

      const showList = this.list.slice(start, end)

      this.send(showList)
    }
  },
  methods: {
    changePer(number) {
      this.config.itemsPerPage = parseInt(number);
      this.config.currentPage = 1;

      this.calcPages();


      const start = (this.config.currentPage-1) * this.config.itemsPerPage;
      const end = start + this.config.itemsPerPage;

      const showList = this.list.slice(start, end);

      this.send(showList)
    },
    calcPages() {
      let pages;
      if (this.config.totalItems/this.config.itemsPerPage === parseInt(this.config.totalItems/this.config.itemsPerPage)) {
        pages = parseInt(this.config.totalItems/this.config.itemsPerPage);
      } else {
        pages = parseInt(this.config.totalItems/this.config.itemsPerPage)+1;
      }

      if (pages <= 2) {
        this.config.pagesLength = pages + 1;
      } else if (pages > 10) {
        this.config.pagesLength = 10;
      } else {
        this.config.pagesLength = pages - 1;
      }
    },
    send(list) {
      const tmp = {
        currentIndex: (this.config.currentPage-1)*this.config.itemsPerPage,
        showList: list
      }

      this.$dispatch('paginateTmp', tmp);
    },
  },
  events: {
    'getPaginationList'(list) {
      if (!list) {
        list = [];
      }
      this.list = list;
      this.config.totalItems = list.length;
      this.calcPages();

      const showList = list.slice(0, this.config.itemsPerPage);

      this.send(showList);
    },
  }
}
</script>