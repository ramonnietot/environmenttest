import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import ActivityList from '@/components/ActivityList'
import EventList from '@/components/EventList'
import TicketsList from '@/components/TicketsList'
import TicketDetail from '@/components/TicketDetail'
import Reader from '@/components/Reader'
import VCalendar from 'v-calendar'
import 'v-calendar/lib/v-calendar.min.css'

Vue.use(Router)
Vue.use(VCalendar, {
  firstDayOfWeek: 2, // Monday

  showLinkedButtons: true,
  popoverVisibility: 'focus'

})

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Login',
      component: Login
    },
    {
      path: '/activity',
      name: 'ActivityList',
      component: ActivityList
    },
    {
      path: '/event',
      name: 'EventList',
      component: EventList
    },
    {
      path: '/tickets',
      name: 'TicketsList',
      component: TicketsList
    },
    {
      path: '/detail',
      name: 'TicketDetail',
      component: TicketDetail
    },
    {
      path: '/reader',
      name: 'Reader',
      component: Reader
    }
  ]
})
