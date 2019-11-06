import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser, faAt, faLock, faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import Toasted from 'vue-toasted';
import Navbar from '@/components/Navbar/Navbar.vue';

library.add(faUser, faAt, faLock, faCog);

Vue.use(BootstrapVue);
Vue.use(Toasted);
Vue.component('font-awesome-icon', FontAwesomeIcon);

export default {
  name: 'App',
  components: {
    Navbar
  },
  data: function () {
    return {
      form: {
        name: ''
      },
      doneLoginCheck: false,
      submitting: false,
      newSite: null
    };
  },
  computed: {
    siteKnown: function () {
      return this.$root.siteKnown;
    },
    initedPlugin: function () {
      return this.$root.initedPlugin;
    }
  },
  watch: {
    siteKnown: function () {
      window.plug.fetch(
        this.$root.getAPIEndpoint('users/me'),
        { credentials: 'include' }
      ).then(
        r => r.json()
      ).then(
        this.onAuthSuccess
      ).finally(
        this.onAuthComplete
      );
    }
  },
  methods: {
    onAuthSuccess: function (json) {
      this.$root.loggedInUser = json.user;
    },
    onAuthComplete: function () {
      this.doneLoginCheck = true;
      this.$nextTick(function () {
        document.getElementById('app').focus();
      });
    },
    onFormSubmit: function () {
      if (this.submitting) return;
      this.submitting = true;
      window.plug.fetch(
        this.$root.getAPIEndpoint('sites'), {
          credentials: 'include',
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: this.form.name
          })
        }
      ).then(
        r => r.json()
      ).then(
        this.onSiteSuccess
      ).finally(
        this.onSiteComplete
      );
    },
    onSiteSuccess: function (json) {
      this.newSite = json.site;
    },
    onSiteComplete: function () {
      this.submitting = false;
    }
  }
};
