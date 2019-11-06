import Vue from 'vue';
import Router from 'vue-router';
import Plugins from '@/components/Plugins/Plugins.vue';

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'Plugins',
      component: Plugins,
      meta: {
        title: 'View Plugins'
      }
    }
  ]
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title + ' - Plugin Directory';
  next();
});

export default router;
