<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>

  import axios from 'axios'
  export default {
    name: 'App',
    data () {
      return {
        apiurl: process.env.VUE_APP_SERVER,
        authenticated: localStorage.qttr_authenticated,
        online: localStorage.qttr_online === 'true',
        sycronizing: false,
        errorsync: false,
        response: null
      }
    },

    mounted () {
console.log(process.env)
    },

    methods: {
      setAuthenticated (logged, userId, username) {
        localStorage.qttr_authenticated = logged
        localStorage.qttr_authuserid = userId
        localStorage.qttr_authusername = username
        this.authenticated = logged
      },
      sincronizar () {
        var d = this.$data
        d.sycronizing = true
        d.errorsync = false

        this.uploadData()
      },
      uploadData () {
        var t = this
        var d = this.$data

        if (localStorage.qttr_ticketList) {
          var tickets = []
          var completeLists = JSON.parse(localStorage.getItem('qttr_ticketList'))
          for (var i = 0; i < completeLists.length; i++) {
            for (var j = 0; j < completeLists[i].ticket.length; j++) {
              if (completeLists[i].ticket[j].checked) {
                tickets.push({
                  'id': completeLists[i].ticket[j].id,
                  'checkedDate': completeLists[i].ticket[j].checkedDate,
                  'checkedTime': completeLists[i].ticket[j].checkedTime
                })
              }
            }
          }

          var bodyFormData = {
            userId: localStorage.qttr_authuserid,
            tickets: tickets
          }

          axios.post(
                  // globaldata.baseurl + '/hotel/rates',
                  d.apiurl + '/cms/updatetickets',
                  bodyFormData,
                  {
                    headers: {
                      'Content-Type': 'application/json'
                    }
                  }
          )
                  .then(function (response) {
                    if (response.data.statusCode === 200) {
                      t.downloadData()
                    } else {
                      d.errorsync = true
                      d.online = !d.online
                      localStorage.qttr_online = d.online
                      d.sycronizing = false
                    }
                  })
                  .catch(function (error) {
                    console.log(error)
                    d.errorsync = true
                    d.online = !d.online
                    localStorage.qttr_online = d.online
                    d.sycronizing = false
                  })
        } else {
          t.downloadData()
        }
      },
      downloadData () {
        var t = this
        var d = this.$data

        axios({
          method: 'get',
          url: d.apiurl + '/cms/offlinechecklist'
        })
                .then(function (response) {
                  console.log(response.data)
                  if (response.data) {
                    d.response = response.data
                    localStorage.setItem('qttr_activityList', JSON.stringify(d.response.activity))
                    localStorage.setItem('qttr_eventList', JSON.stringify(d.response.event))
                    localStorage.setItem('qttr_ticketList', JSON.stringify(d.response.ticketList))

                    d.errorsync = false
                    localStorage.qttr_online = d.online
                    d.sycronizing = false

                    t.$router.push({name: 'Login'})
                  } else {
                    d.errorsync = true
                    d.online = !d.online
                    localStorage.qttr_online = d.online
                    d.sycronizing = false
                  }
                })

                .catch(function (error) {
                  d.errorsync = true
                  d.online = !d.online
                  localStorage.qttr_online = d.online
                  d.sycronizing = false

                  console.log(error)
                })
      },
      logout () {
        this.setAuthenticated(false, null, null)
        this.$router.push({name: 'Login'})
      }
    }
  }
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /**/
    color: #2c3e50;

  }
  #app-body{
    margin-top: 30px;
    width:90%;
  }
  .main-title{
    font-size: 1.5em;
  }
</style>
