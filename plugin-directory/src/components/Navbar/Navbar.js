import AuthModal from '@/modals/Auth/Auth.vue';

export default {
  name: 'Navbar',
  components: {
    AuthModal
  },
  data: function () {
    return {
      authMode: 'register'
    };
  },
  methods: {
    signOut: function () {
      window.plug.fetch(
        this.$root.getAPIEndpoint('session'), {
          credentials: 'include',
          method: 'DELETE'
        }
      ).then(r => {
        if (!r.ok) {
          throw new Error('Failed to sign out');
        }
      }).then(
        this.onSignOutSuccess
      ).catch(
        this.onSignOutFailure
      );
    },
    onSignOutSuccess: function () {
      this.$root.loggedInUser = null;
      window.plug.PluginAPI.disableAll({
        exclude: [ window.plug.pluginId ]
      });
    },
    onSignOutFailure: function () {
      this.$toasted.error('Failed to sign out', { duration: 3000 });
    }
  }
};
