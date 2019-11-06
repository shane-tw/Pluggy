export default {
  name: 'PluginModal',
  props: ['mode'],
  computed: {
    title: function () {
      if (this.mode === 'edit') {
        return 'Edit Plugin';
      }
      return 'Add Plugin';
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
      let pluginURL = this.$root.getAPIEndpoint('plugins');

      this.$root.getBase64(this.form.file).then((file) => {
        window.plug.fetch(
          pluginURL, {
            credentials: 'include',
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: this.form.name,
              description: this.form.description,
              file: file
            })
          }
        ).then(r =>
          r.json()
        ).then(json => {
          if (json.plugin) {
            this.onPluginSuccess(json);
          } else {
            this.onPluginFailure(json);
          }
        }).catch(
          this.onPluginFailure
        ).finally(
          this.onPluginComplete
        );
      });
    },
    onPluginSuccess: function () {
      this.$refs.pluginModal.hide();
      this.$emit('plugin-created');
    },
    onPluginFailure: function (json) {
      if (json && json.errors) {
        this.$toasted.error(json.errors[0].reason, { duration: 3000 });
      } else {
        this.$toasted.error('Failed to save plugin', { duration: 3000 });
      }
    },
    onPluginComplete: function () {
      this.authenticating = false;
    },
    onModalHidden: function () {
      for (const key in this.form) {
        this.form[key] = '';
      }
      this.$refs.pluginUpload.reset();
      this.$nextTick(function () {
        this.$refs.pluginForm.reset();
      });
      document.getElementById('app').focus();
    },
    focusFirstInput: function () {
      this.$refs.pluginForm.getElementsByTagName('input')[0].focus();
    }
  },
  data: function () {
    return {
      form: {
        name: '',
        description: ''
      },
      authenticating: false
    };
  }
};
