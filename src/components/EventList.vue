<template>
  <div id="main-app">
    <nav  class="red-guitart">
      <div class="nav-wrapper center">
        <ul>
          <li><a class=" left" @click="back()"><i class="material-icons">arrow_back</i></a></li>
        </ul>
        <a class="right" @click="logout()"><i class="material-icons" style="margin-right: 15px;">power_settings_new</i></a>
        <div class="main-title" >Events</div>

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
     <div class="row">
       <div class="col s12">

         <h6 class="amber-text text-darken-2 ">{{date}} {{activityName}}</h6>

       </div>
     </div>

    <div v-if="events && events.length > 0" class="row">
      <blockquote><h5>Events:</h5></blockquote>
      <div class="collection">
        <a v-for="(ev,index) in events"  v-if="ev.name && ev.id" style="text-align: left;"  class="collection-item" @click="select(ev.id,ev.name)" v-bind:key="index">{{ev.name}}</a>
      </div>
    </div>
    <div v-else class="row">
      <h6>No available events for the selected date</h6>
    </div>
  </div>
  </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'EventList',
  data: function () {
    return {
      status: this.$parent.online,
      date: this.$route.query.date,
      activityId: this.$route.query.activityId,
      activityName: this.$route.query.activityName,
      events: null,
      username: localStorage.qttr_authusername
    }
  },

  mounted () {
    if (!this.$parent.authenticated) {
      this.$router.push({
        name: 'Login'
      })
    }
    this.getEvents()
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
        name: 'TicketsList',
        query: {
          eventId: id,
          eventName: name,
          activityName: d.activityName,
          activityId: d.activityId,
          date: d.date,
          username: localStorage.qttr_authusername
        }

      })
    },
    back: function () {
      this.$router.push({
        name: 'ActivityList'
      })
    },
    getEvents: function () {
      var t = this
      var d = this.$data
      if (d.status) {
        axios({
          method: 'get',
          url: t.$parent.$data.apiurl + '/cms/eventchecklist',
          params: {
            date: d.date.replace(/-/g, ''),
            activityId: d.activityId

          }
        })
          .then(function (response) {
            d.events = response.data.event
            console.log(d.events)
          })

          .catch(function (error) {
            console.log(error)
          })
      } else {
        var completeEvents = JSON.parse(localStorage.getItem('qttr_eventList'))
        d.events = []
        for (var i = 0; i < completeEvents.length; i++) {
          if (completeEvents[i].activityId === d.activityId) {
            d.events.push(completeEvents[i])
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
