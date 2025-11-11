import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', redirect: '/mine' },
  {
    path: '/mine',
    name: 'myPosts',
    component: () => import('../views/MyPosts.vue'),
  },
];

const router = createRouter({ history: createWebHistory(), routes });

export default router;
