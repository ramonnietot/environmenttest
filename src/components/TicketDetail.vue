<template>
  <div>
    <nav class="red-guitart">
    <div class="nav-wrapper center">
      <ul>
        <li><a class=" left" @click="back()"><i class="material-icons">arrow_back</i></a></li>
      </ul>
      <a class="right" @click="logout()"><i class="material-icons" style="margin-right: 15px;">power_settings_new</i></a>
      <div class="main-title" >Ticket Detail</div>
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
    <table>
      <tbody>
      <tr>
        <td>Lead Name</td>
        <td>{{leadname}}</td>
      </tr>

      <tr>
        <td>Ticket Id</td>
        <td>{{ticketId}}</td>
      </tr>
      <tr>
        <td>Pax</td>
        <td>{{pax}}</td>
      </tr>
      <tr>
        <td>QR Code</td>
        <td>{{qrcode}} </td>
      </tr>
      <tr>
        <td>Commets</td>
        <td>{{comments}} </td>
      </tr>
      </tbody>
    </table>

    <div class="row center">
      <div v-if="checked">
        <div>
          <i class=" material-icons green-text large center">check</i>
        </div>
        <div>
          checkedDate: {{checkedDate}}
          checkedTime: {{checkedTime}}
        </div>
      </div>
      <div v-else>
        <div><i class=" material-icons red-text large center">clear</i></div>

        <div><a class="btn" @click="checkTicket">Check</a></div>
        <div class="red-text">
          <h5>{{msgerror}}</h5></div>
      </div>
    </div>
</div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'TicketDetail',

  data: function () {
    return {
      status: this.$parent.online,
      date: this.$route.query.date,
      activityName: this.$route.query.activityName,
      activityId: this.$route.query.activityId,
      eventName: this.$route.query.eventName,
      eventId: this.$route.query.eventId,
      ticketId: this.$route.query.ticketId,
      leadname: this.$route.query.leadname,
      checked: this.$route.query.checked,
      checkedDate: this.$route.query.checkedDate,
      checkedTime: this.$route.query.checkedTime,
      comments: this.$route.query.comments,
      pax: this.$route.query.pax,
      qrcode: this.$route.query.qrcode,
      msgerror: null,
      username: localStorage.qttr_authusername

    }
  },

  mounted () {
    if (!this.$parent.authenticated) {
      this.$router.push({
        name: 'Login'
      })
    }
  },
  methods: {
    sync () {
      this.$parent.sincronizar()
    },
    logout: function () {
      this.$parent.logout()
    },
    back: function () {
      var d = this.$data
      this.$router.push({
        name: 'TicketsList',
        query: {
          activityId: d.activityId,
          eventId: d.eventId,
          eventName: d.eventName,
          activityName: d.activityName,
          date: d.date
        }
      })
    },
    currentDate: function () {
      var d = new Date()
      var month = '' + (d.getMonth() + 1)
      var day = '' + d.getDate()
      var year = d.getFullYear()

      if (month.length < 2) month = '0' + month
      if (day.length < 2) day = '0' + day

      return [year, month, day].join('')
    },
    currentTime: function () {
      var d = new Date()
      var hour = d.getHours() < 10 ? '0' + d.getHours() : '' + d.getHours()
      var min = d.getMinutes() < 10 ? '0' + d.getMinutes() : '' + d.getMinutes()
      var sec = d.getSeconds() < 10 ? '0' + d.getSeconds() : '' + d.getSeconds()

      return [hour, min, sec].join('')
    },
    checkTicket: function () {
      var t = this
      var d = this.$data
      if (d.status) {
        axios({
          method: 'get',
          url: t.$parent.$data.apiurl + '/cms/checkticket',
          params: {
            eventId: d.eventId,
            qrcode: d.qrcode,
            userId: localStorage.qttr_authuserid
          }
        })
          .then(function (response) {
            d.tickets = response.data
            if (d.tickets.valid) {
              d.checked = true
            } else {
              d.msgerror = d.tickets.validationMessage
            }
          })

          .catch(function (error) {
            console.log(error)
          })
      } else {
        var completeLists = JSON.parse(localStorage.getItem('qttr_ticketList'))
        for (var i = 0; i < completeLists.length; i++) {
          if (completeLists[i].eventId === d.eventId) {
            for (var j = 0; j < completeLists[i].ticket.length; j++) {
              if (completeLists[i].ticket[j].qrcode === d.qrcode) {
                completeLists[i].ticket[j].checked = true
                d.checked = true

                let checkDate = this.currentDate()
                let checkTime = this.currentTime()

                completeLists[i].ticket[j].checkedDate = checkDate
                completeLists[i].ticket[j].checkedTime = checkTime
                d.checkedDate = checkDate
                d.checkedTime = checkTime
              }
            }
          }
        }

        localStorage.setItem('qttr_ticketList', JSON.stringify(completeLists))
      }
    }
  }

}
</script>

<style scoped>

</style>
