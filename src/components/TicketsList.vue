<template>
  <div id="main-app">
    <nav class="red-guitart">
      <div class="nav-wrapper center">
        <ul>
       <li><a class=" left" @click="back()"><i class="material-icons">arrow_back</i></a></li>
        </ul>
        <ul class="right ">
          <li><a @click="scan()"><i class="material-icons">tablet_android</i></a></li>
          <li><a @click="logout()"><i class="material-icons">power_settings_new</i></a></li>
        </ul>
        <div class="main-title" style="padding-left: 108px">Ticket List</div>

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
        <div v-if="$parent.$data.errorsync" class="red lighten-5 red-text" style="font-size: 0.9rem;padding-left:15px;">ynchronization error. Try it later</div>

      </div>
    <div id="app-body" class="container">

      <div class="row">
      <div class="col s12">
        <h6 class="amber-text text-darken-2 center">{{date}} {{activityName}} {{eventName}}</h6>
      </div>
      </div>
    <div v-if="tickets && tickets.ticket && tickets.ticket.length > 0" class="row">
      <div class="col s12">
        <blockquote><h5>Resume:</h5></blockquote>

      <table >
        <thead>
        <tr>
          <th></th>
          <th><span  class="right">Total</span></th>
          <th><span  class="right">Checked</span></th>
          <th><span  class="right">Remaining</span></th>
        </tr>
        </thead>

        <tbody>
        <tr>
          <td>Tickets</td>
          <td> <span class="right" >{{tickets.totalTickets}}</span> </td>
          <td> <span  class="green-text right">{{tickets.checkedTickets}}</span> </td>
          <td> <span  class="red-text right">{{tickets.remainingTickets}}</span> </td>

        </tr>
        <tr>
          <td>Pax</td>
          <td> <span  class="right">{{tickets.totalPax}}</span> </td>
          <td> <span  class="green-text right">{{tickets.checkedPax}}</span> </td>
          <td> <span  class="red-text right">{{tickets.remainingPax}}</span> </td>
        </tr>

        </tbody>
      </table>
        <blockquote><h5>Ticket List:</h5></blockquote>
      <table>
        <thead>
        <tr>
          <th> Lead Name</th>
      <!--    <th>Tiket Numer</th>-->
          <th ><span class="right">Pax</span></th>
          <th><span class="right">Checked</span></th>

        </tr>
        </thead>

        <tbody>
        <tr v-for="(ti, index) in tickets.ticket" @click="viewDetail(index)"  v-bind:key="index">
          <td>{{ti.leadname}}</td>
          <!--<td>{{ti.id}} </td>-->
          <td><span class="right">{{ti.pax}}</span></td>
          <td v-if="ti.checked"><i class=" material-icons green-text right">check</i></td>
          <td v-else><i class=" material-icons red-text right">clear</i></td>

         </tr>
        </tbody>
      </table>
      </div>
    </div>
    <div v-else class="row">
      <div class="col s12">
      <h6>No ticket List for selected event</h6>
      </div>
    </div>

</div>
  </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'TicketsList',
  data: function () {
    return {
      status: this.$parent.online,
      date: this.$route.query.date,
      activityId: this.$route.query.activityId,
      activityName: this.$route.query.activityName,
      eventId: this.$route.query.eventId,
      eventName: this.$route.query.eventName,
      tickets: null,
      username: localStorage.qttr_authusername
    }
  },

  mounted () {
    if (!this.$parent.authenticated) {
      this.$router.push({
        name: 'Login'
      })
    }
    this.getTickets()
  },
  methods: {
    sync () {
      this.$parent.sincronizar()
    },
    logout: function () {
      this.$parent.logout()
    },
    scan: function () {
      var d = this.$data
      this.$router.push({
        name: 'Reader',
        query: {
          date: d.date,
          activityName: d.activityName,
          activityId: d.activityId,
          eventName: d.eventName,
          eventId: d.eventId
        }
      })
    },
    back: function () {
      var d = this.$data
      this.$router.push({
        name: 'EventList',
        query: {
          date: d.date,
          activityId: d.activityId,
          activityName: d.activityName,
          eventId: d.eventId
        }
      })
    },
    getTickets: function () {
      var t = this
      var d = this.$data

      if (d.status) {
        axios({
          method: 'get',
          url: t.$parent.$data.apiurl + '/cms/ticketchecklist',
          params: {
            eventId: d.eventId
          }
        })
          .then(function (response) {
            d.tickets = response.data.ticket
          })

          .catch(function (error) {
            localStorage.qttr_online = d.onlinee.log(error)
          })
      } else {
        var completeLists = JSON.parse(localStorage.getItem('qttr_ticketList'))

        var totalTickets = 0
        var checkedTickets = 0
        var remainingTickets = 0
        var totalPax = 0
        var checkedPax = 0
        var remainingPax = 0

        for (var i = 0; i < completeLists.length; i++) {
          if (completeLists[i].eventId === d.eventId) {
            d.tickets = completeLists[i]
          }
        }
        for (var j = 0; j < d.tickets.ticket.length; j++) {
          totalTickets++
          totalPax = totalPax + d.tickets.ticket[j].pax

          if (d.tickets.ticket[j].checked === 'true' || d.tickets.ticket[j].checked === true) {
            checkedTickets++
            checkedPax = checkedPax + d.tickets.ticket[j].pax
          } else {
            remainingTickets++
            remainingPax = remainingPax + d.tickets.ticket[j].pax
          }
        }

        d.tickets.totalTickets = totalTickets
        d.tickets.checkedTickets = checkedTickets
        d.tickets.remainingTickets = remainingTickets

        d.tickets.totalPax = totalPax
        d.tickets.checkedPax = checkedPax
        d.tickets.remainingPax = remainingPax
      }
    },
    viewDetail: function (index) {
      var d = this.$data
      this.$router.push({
        name: 'TicketDetail',
        query: {
          date: d.date,
          activityName: d.activityName,
          activityId: d.activityId,
          eventName: d.eventName,
          eventId: d.eventId,
          ticketId: d.tickets.ticket[index].id,
          leadname: d.tickets.ticket[index].leadname,
          checked: d.tickets.ticket[index].checked,
          checkedDate: d.tickets.ticket[index].checkedDate,
          checkedTime: d.tickets.ticket[index].checkedTime,
          comments: d.tickets.ticket[index].comments,
          pax: d.tickets.ticket[index].pax,
          qrcode: d.tickets.ticket[index].qrcode
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
