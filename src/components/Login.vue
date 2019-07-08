<template>
  <div id="main-app">
    <nav class="red-guitart">
      <div class="nav-wrapper center">
        <!--<a class="brand-logo right" @click="logout()"><i class="material-icons">power_settings_new</i></a>-->
        <div class="main-title">Login</div>

      </div>
    </nav>

      <div>
        <div class="switch" style="padding:10px 15px 15px;">
          <label>
            Offline
            <input type="checkbox"   @change ="sync()" v-model="$parent.online">
            <span class="lever"></span>
            Online

          </label>

        </div>
        <div v-if="$parent.$data.errorsync" class="red lighten-5 red-text" style="font-size: 0.9rem;padding-left:15px;">Error al sincronizar. Intentelo mas tarde</div>

      </div>
    <div id="app-body" class="container">
    <div class="row">
      <form class="col s12">
        <div class="row">
          <div class="input-field col s12">
            <input  id="username" type="text" class="validate" v-model="user">
            <label for="username">User Name</label>
          </div>
          <div class="input-field col s12">
            <input id="password" type="password" class="validate" v-model="password">
            <label for="password">Password</label>
          </div>
          <div class="red-text center"> {{message}}</div>
          <div class="input-field col s12 center">
            <a class="waves-effect waves-light btn" @click="login()">Login</a>
          </div>

        </div>
      </form>
    </div>
    </div>
  </div>

</template>

<script>
import axios from 'axios'
export default {
  name: 'Login',

  data: function () {
    return {
      status: this.$parent.online,
      user: null,
      password: null,
      response: null,
      message: null
    }
  },

  mounted () {
    if (this.$parent.authenticated === 'true' || this.$parent.authenticated === true) {
      this.$router.push({
        name: 'ActivityList'
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
    login: function () {
      var t = this
      var d = this.$data
      var bodyFormData = {
        user: d.user,
        password: d.password // encriptar
      }

      axios.post(
        t.$parent.$data.apiurl + '/cms/login',
        bodyFormData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
        .then(function (response) {
          d.message = null

          if (response.data.logged === true) {
            t.$parent.setAuthenticated(true, response.data.authUser, d.user)
            t.$router.push({
              name: 'ActivityList',
              params: {
                userId: response.data.authUser
              }

            })
          } else {
            d.message = response.data.message
          }
        })
        .catch(function (error) {
          console.log(error)
        })
    }
  }
}
</script>

<style scoped>

</style>
