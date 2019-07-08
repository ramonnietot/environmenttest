<template>
<div id="main-app">
  <nav class="red-guitart">
    <div class="nav-wrapper center">
      <a class=" right" @click="logout()" style="margin-right: 15px;"><i class="material-icons">power_settings_new</i></a>
      <div class="main-title"  style="margin-left: 50px">Activities</div>

    </div>
  </nav>
  <div v-if="$parent.$data.sycronizing" class="container"  style="padding:10px 15px 15px;">
    <h4>Synchronizing</h4>
    <div class="progress">
      <div class="indeterminate"></div>
    </div>
  </div>
  <div v-else>

  <div>
    <div class="switch" style="padding:10px 15px 15px;">
      <label>
        Offline
        <input type="checkbox"   @change ="sync()" v-model="$parent.online">
        <span class="lever"></span>
        Online

      </label>

      <div class=" right" > User: {{username}}</div>
    </div>
    <div v-if="$parent.$data.errorsync" class="red lighten-5 red-text" style="font-size: 0.9rem;padding-left:15px;">Synchronization error. Try it later</div>

  </div>

  <div id="app-body" class="container">

    <blockquote> <h5>Select Date:</h5></blockquote>
      <v-date-picker v-model='selectedDate'></v-date-picker>

  <div v-if="excursions && excursions.length > 0" class="row">
    <blockquote><h5>Activities:</h5></blockquote>
    <div class="collection">
      <a v-for="(ex, index) in excursions" style="text-align: left;" class="collection-item " @click="select(ex.activityId,ex.name)" v-bind:key="index">{{ex.name}}</a>

    </div>
  </div>
  <div v-else class="row">
    <h6>No available excursions for the selected date</h6>
  </div>
  </div>
  </div>
</div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'ActivityList',
  data: function () {
    return {
      status: this.$parent.online,
      date: null,
      selectedDate: new Date(),
      excursion: null,
      excursions: null,
      username: localStorage.qttr_authusername

    }
  },
  watch: {
    selectedDate: function (val) {
      var d = this.$data
      d.date = this.formatDate(val)
      this.getActivities()
    }

  },
  mounted () {
    console.log(typeof status)
    var d = this.$data

    if (!this.$parent.authenticated) {
      this.$router.push({
        name: 'Login'
      })
    }

    d.date = this.formatDate(d.selectedDate)
    this.getActivities()
  },
  methods: {
    sync () {
      this.$parent.sincronizar()
    },
    logout: function () {
      this.$parent.logout()
    },
    select: function (id, name) {
      var d = this.$data
      this.$router.push({
        name: 'EventList',
        query: {
          date: d.date,
          activityId: id,
          activityName: name
        }
      })
    },
    formatDate: function (date) {
      var d = new Date(date)
      var month = '' + (d.getMonth() + 1)
      var day = '' + d.getDate()
      var year = d.getFullYear()

      if (month.length < 2) month = '0' + month
      if (day.length < 2) day = '0' + day

      return [year, month, day].join('-')
    },
    getActivities: function () {
      var t = this
      var d = this.$data

      if (d.status) {
        axios({
          method: 'get',
          url: t.$parent.$data.apiurl + '/cms/activitychecklist',
          params: {
            date: d.date.replace(/-/g, '')
          }
        })
          .then(function (response) {
            d.excursions = response.data.activity
          })

          .catch(function (error) {
            console.log(error)
          })
      } else {
        d.excursions = []
        var parseDate = d.date.replace(/-/g, '')
        var completeEx = JSON.parse(localStorage.getItem('qttr_activityList'))

        for (var i = 0; i < completeEx.length; i++) {
          if (completeEx[i].date.toString() === parseDate) {
            d.excursions.push(completeEx[i])
          }
        }
      }
    }
  }
}

</script>

<style scoped>

</style>
