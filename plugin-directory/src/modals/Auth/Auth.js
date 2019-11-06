export default {
  name: 'AuthModal',
  props: ['mode'],
  computed: {
    title: function () {
      if (this.mode === 'login') {
        return 'Log in';
      }
      return 'Register';
    }
  },
  methods: {
    onModalSubmit: function (e) {
      this.onFormSubmit();
      e.preventDefault();
    },
    onFormSubmit: function () {
      if (this.authenticating) return;
      this.authenticating = true;
      let authURL = this.$root.getAPIEndpoint('session');
      if (this.mode === 'register') {
        authURL = this.$root.getAPIEndpoint('users');
      }

      window.plug.fetch(
        authURL, {
          credentials: 'include',
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.form)
        }
      ).then(r =>
        r.json()
      ).then(json => {
        if (json.user) {
          this.onAuthSuccess(json);
        } else {
          this.onAuthFailure(json);
        }
      }).catch(
        this.onAuthFailure
      ).finally(
        this.onAuthComplete
      );
    },
    onAuthSuccess: function (json) {
      this.$root.loggedInUser = json.user;
      this.$refs.authModal.hide();
      this.$toasted.success('Logged in successfully', { duration: 3000 });
      window.plug.Store.set('logged_in', Date.now());
    },
    onAuthFailure: function (json) {
      if (json && json.errors) {
        this.$toasted.error(json.errors[0].reason, { duration: 3000 });
      } else {
        this.$toasted.error('Failed to authenticate', { duration: 3000 });
      }
    },
    onAuthComplete: function () {
      this.authenticating = false;
    },
    onModalHidden: function () {
      for (const key in this.form) {
        this.form[key] = '';
      }
      this.$nextTick(function () {
        this.$refs.authForm.reset();
      });
      document.getElementById('app').focus();
    },
    focusFirstInput: function () {
      this.$refs.authForm.getElementsByTagName('input')[0].focus();
    }
  },
  data: function () {
    return {
      form: {
        firstName: '',
        lastName: '',
        email: '',
        password: ''
      },
      authenticating: false
    };
  }
};
