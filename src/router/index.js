// Composables
import { createRouter, createWebHistory } from 'vue-router'

const routes = [

  // RUTA DEL LAYOUT DE LOGIN

  {
    path: '/',
    component: () => import('@/layouts/login/LoginLayout.vue'),
    children: [
      {
        path: '',
        name: 'Login',
        component: () => import(/* webpackChunkName: "home" */ '@/views/LoginView.vue'),
      }
    ],
  },

  // RUTA DEL LAYOUT DE HOME
  {
    path: '/home',
    component: () => import('@/layouts/home/HomeLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import(/* webpackChunkName: "home" */ '@/views/UserView.vue'),
      },
      {
        path: '/users',
        name: 'Users',
        component: () => import(/* webpackChunkName: "home" */ '@/views/UserView.vue'),
      },
      {
        path: '/projects',
        name: 'Projects',
        component: () => import(/* webpackChunkName: "home" */ '@/views/ProjectView.vue'),
      },
      {
        path: '/donors',
        name: 'Donors',
        component: () => import(/* webpackChunkName: "home" */ '@/views/DonorsView.vue'),
      },
      {
        path: '/doness',
        name: 'Doness',
        component: () => import(/* webpackChunkName: "home" */ '@/views/DonessView.vue'),
      }
    ],
  },

]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
