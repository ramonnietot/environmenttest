<template>
  <div>
    <nav class="red-guitart">
      <div class="nav-wrapper center">
        <ul>
          <li><a class=" left" @click="back()"><i class="material-icons">arrow_back</i></a></li>
        </ul>
        <!--<a class="right" @click="exit()"><i  style="margin-right: 15px;" class="material-icons">power_settings_new</i></a>-->
        <a class="right" @click="logout()"><i  style="margin-right: 15px;" class="material-icons">power_settings_new</i></a>

        <div class="main-title">Scan QR</div>

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

    <div v-if="showScan" class="center" style=" margin-top: 30px;">
      <vue-qr-reader :stop-on-scanned="stopscan" v-on:code-scanned="codeArrived" v-on:error-captured="errorCaptured"></vue-qr-reader>
    </div>
    <div id="app-body" class="container center">

    <div v-if="code && response" >

      <div v-if="response.valid">
        <div class=" readed green-text">
          <table>
            <tr>
              <td> Readed Code:</td>
              <td>{{code}}</td>
            </tr>
          </table>
        </div>
        <table>
          <tbody>
          <tr>
            <td>Lead Name</td>
            <td>{{response.ticket.leadname}}</td>
          </tr>

          <tr>
            <td>Ticket Id</td>
            <td>{{response.ticket.id}}</td>
          </tr>
          <tr>
            <td>Pax</td>
            <td>{{response.ticket.pax}}</td>
          </tr>
          <tr>
            <td>QR Code</td>
            <td>{{response.ticket.qrcode}} </td>
          </tr>
          <tr>
            <td>Comments</td>
            <td>{{response.ticket.comments}} </td>
          </tr>
          </tbody>
        </table>

        <div class="row">
            <div>
              <i class=" material-icons green-text large center">check</i>
            </div>
            <div>
              checkedDate: {{response.ticket.checkedDate}}
              checkedTime: {{response.ticket.checkedTime}}
            </div>

        </div>
      </div>
      <div v-else>
        <div class=" readed red-text">
          <table>
            <tr>
              <td> Readed Code:</td>
              <td>{{code}}</td>
            </tr>
            <tr>
              <td> Not valid</td>
              <td>{{response.validationMessage}}</td>
            </tr>
          </table>
        </div>
      </div>
      <div class="center" style="margin-top: 20px;">
        <a class="btn" @click="refresh">Scan</a>
      </div>
    </div>
    <div v-else>
      Scanning...
    </div>
    </div>

  </div>
  </div>
</template>

<script>

import VueQrReader from 'vue-qr-reader/dist/lib/vue-qr-reader.umd.js'
import axios from 'axios'
export default {
  name: 'Reader',
  data: function () {
    return {
      status: this.$parent.online,
      date: this.$route.query.date,
      activityId: this.$route.query.activityId,
      activityName: this.$route.query.activityName,
      eventId: this.$route.query.eventId,
      eventName: this.$route.query.eventName,
      code: null,
      showScan: true,
      stopscan: false,
      response: null,
      username: localStorage.qttr_authusername

    }
  },
  components: {
    VueQrReader
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
    refresh () {
      var d = this.$data
      d.showScan = true
      d.code = null
    },
    exit () {
      history.back()
    },
    back () {
      var d = this.$data
      this.$router.push({
        name: 'TicketsList',
        query: {
          eventId: d.eventId,
          activityId: d.activityId,
          eventName: d.eventName,
          activityName: d.activityName,
          date: d.date
        }

      })
    },
    codeArrived (event) {
      var d = this.$data
      d.code = event

      if (d.code) {
        d.showScan = false

        if (d.status) {
          this.checkTicket(d.code)
        } else {
          this.checkOffline(d.code)
        }
      } else {

      }
    },
    errorCaptured (error) {
      switch (error.name) {
        case 'NotAllowedError':
          this.errorMessage = 'Camera permission denied.'
          break
        case 'NotFoundError':
          this.errorMessage = 'There is no connected camera.'
          break
        case 'NotSupportedError':
          this.errorMessage = 'Seems like this page is served in non-secure context.'
          break
        case 'NotReadableError':
          this.errorMessage = 'Couldn\'t access your camera. Is it already in use?'
          break
        case 'OverconstrainedError':
          this.errorMessage = 'Constraints don\'t match any installed camera.'
          break
        default:
          this.errorMessage = 'UNKNOWN ERROR: ' + error.message
      }
      console.error(this.errorMessage)
    },
    checkTicket (qrcode) {
      var t = this
      var d = this.$data

      axios({
        method: 'get',
        url: t.$parent.$data.apiurl + '/cms/checkticket',
        params: {
          eventId: d.eventId,
          qrcode: qrcode,
          userId: localStorage.qttr_authuserid
        }
      })
        .then(function (response) {
          d.response = response.data
        })

        .catch(function (error) {
          console.log(error)
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
    checkOffline (qrcode) {
      var d = this.$data

      d.response = {'valid': false,
        'validationMessage': 'Invalid ticket for this excursion'}

      var completeLists = JSON.parse(localStorage.getItem('qttr_ticketList'))
      for (var i = 0; i < completeLists.length; i++) {
        if (completeLists[i].eventId === d.eventId) {
          for (var j = 0; j < completeLists[i].ticket.length; j++) {
            if (completeLists[i].ticket[j].qrcode === qrcode) {
              if (completeLists[i].ticket[j].checked) {
                d.response = {'valid': false,
                  'validationMessage': 'Ticket already registered'}
              } else {
                completeLists[i].ticket[j].checked = true

                let checkDate = this.currentDate()
                let checkTime = this.currentTime()

                completeLists[i].ticket[j].checkedDate = checkDate
                completeLists[i].ticket[j].checkedTime = checkTime
                d.checkedDate = checkDate
                d.checkedTime = checkTime

                d.response = {'valid': true,
                  'ticket': completeLists[i].ticket[j]}
              }

              break
            }
          }
        }
      }

      localStorage.setItem('qttr_ticketList', JSON.stringify(completeLists))
    }
  }
}
</script>

<style scoped>
  .readed{
    font-size: 1.2em;
  }

</style>
