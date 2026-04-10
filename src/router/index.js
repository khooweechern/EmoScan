import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../components/HomePage.vue'
import AnswerPage from '../components/AnswerPage.vue'
import ResultPage from '../components/ResultPage.vue'
import SharePoster from '../components/SharePoster.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/answer',
      name: 'answer',
      component: AnswerPage,
    },
    {
      path: '/result',
      name: 'result',
      component: ResultPage,
    },
    {
      path: '/share',
      name: 'share',
      component: SharePoster,
    },
  ],
})

export default router
