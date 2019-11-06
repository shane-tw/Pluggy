import Vue from 'vue';
import App from '@/components/App/App.vue';
import router from './router';

Vue.config.productionTip = false;

window.app = new Vue({
  router,
  components: { App },
  render: h => h(App),
  mounted: function () {
    window.plug.init().then(() => {
      this.siteKnown = !!window.plug.siteId;
      this.initedPlugin = true;
    });
  },
  methods: {
    getAPIEndpoint: function (path) {
      if (path.startsWith('/')) path = path.substring(1);
      return location.protocol + '//' + location.hostname + ':4040/api/v1/sites/' + window.plug.siteId + '/' + path;
    },
    getPageTitle: function (title) {
      return 'Plugin Directory - ' + title;
    },
    getBase64 (file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
    }
  },
  data: function () {
    return {
      siteKnown: false,
      initedPlugin: false,
      loggedInUser: null,
      dropdownItems: {
        navbar: []
      }
    };
  }
}).$mount('#app');
