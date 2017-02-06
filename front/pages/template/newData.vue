<template>
<div>
  <simulate-table v-show="table"></simulate-table>
</div>
</template>

<script>
import Vue from 'vue'
import $ from 'jquery'
import SimulateTable from '../../components/SimulateTable'
import { requestHandler } from '../../services/index.js'

export default {
  components: {
    SimulateTable
  },
  data() {
    return {
      data: {},
      station: {},
      table: true,
      stations: {}
    }
  },
  watch: {
    'station'(n, o) {
      this.getStation(n);
    }
  },
  ready() {
    if (JSON.parse(sessionStorage.getItem('station'))) {
      this.getStation(JSON.parse(sessionStorage.getItem('station')));
    }

  },
  methods: {
    getStation(station) {
      if (sessionStorage.getItem('station')) {
        const resource = this.$resource('/apis/data/latest{/id}');
        resource.get({
          id: station.id
        }).then(function (cb) {
          if (cb.body.success) {
            this.table = true;
            this.data = cb.body.data;
            this.$nextTick(() => {
              if (!$.isEmptyObject(this.data)) {
                this.$broadcast('simulateSingle', this.data);
              }
            })
          } else {
            this.table = false;
            this.$dispatch('Warning:dispatch', cb.body.message, 'fail');
          }
        })
      }
    }
  },
  events: {
    'getParentStation'(station) {
      this.station = station;
    },
  }
}
</script>