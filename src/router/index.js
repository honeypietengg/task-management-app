import { createRouter, createWebHistory } from 'vue-router'
import TaskBoardView from '../views/TaskBoardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/taskboard'
    },
    {
      path: '/taskboard',
      name: 'taskboard',
      component: TaskBoardView
    },
  ]
})

export default router
