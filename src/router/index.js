import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../componentes/Login.vue'
import AdminDashboard from '../componentes/AdminDashboard.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { title: 'Ingresa a MarketVue' }
  },
  {
      path: '/admin',
      name: 'admin',
      component: AdminDashboard,
      meta: { title: 'Panel administrador | MarketVUE' }
    }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = to.meta.title
  }
})

export default router