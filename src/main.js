import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './assets/styles/main.css'

// Import views
import Home from './views/Home.vue'
import Review from './views/Review.vue'
import Settings from './views/Settings.vue'

// Create router
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/review',
      name: 'Review',
      component: Review
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings
    }
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')
