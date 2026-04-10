import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from '../components/HomePage.vue'
import AnswerPage from '../components/AnswerPage.vue'
import ResultPage from '../components/ResultPage.vue'
import SharePoster from '../components/SharePoster.vue'
import ComparePage from '../components/ComparePage.vue'
import ComparePoster from '../components/ComparePoster.vue'

const router = createRouter({
  history: createWebHashHistory(),
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
    {
      path: '/compare',
      name: 'compare',
      component: ComparePage,
    },
    {
      path: '/compare-poster',
      name: 'compare-poster',
      component: ComparePoster,
    },
  ],
})

export default router
