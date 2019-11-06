import PluginModal from '@/modals/Plugin/Plugin.vue';

export default {
  name: 'Stats',
  components: {
    PluginModal
  },
  data: function () {
    return {
      plugins: [],
      mode: 'add'
    };
  },
  mounted: function () {
    if (this.$root.loggedInUser) {
      this.updatePlugins();
    }
  },
  methods: {
    updatePlugins: function () {
      window.plug.fetch(
        this.$root.getAPIEndpoint('plugins'),
        { credentials: 'include' }
      ).then(r => {
        if (!r.ok) {
          throw new Error('Failed to retrieve plugins');
        }
        return r.json();
      }).then(
        this.onGetPluginsSuccess
      ).catch(
        this.onGetPluginsFailure
      );
    },
    onGetPluginsSuccess: function (json) {
      const { plugins } = json;
      for (let i = 0; i < plugins.length; i++) {
        const plugin = plugins[i];
        plugin.hasSettings = false;
      }
      this.plugins = plugins;
    },
    onGetPluginsFailure: function () {
      this.$toasted.error('Failed to retrieve plugins', { duration: 3000 });
    },
    enablePlugin: function (plugin) {
      window.plug.fetch(
        this.$root.getAPIEndpoint('users/me/plugins'), {
          credentials: 'include',
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: parseInt(plugin.id, 10)
          })
        }
      );

      plugin.id = plugin.id.toString();
      plug.PluginAPI.enable(plugin);
      plugin.enabled = true;
    },
    disablePlugin: function (plugin) {
      window.plug.fetch(
        this.$root.getAPIEndpoint('users/me/plugins/' + plugin.id), {
          credentials: 'include',
          method: 'DELETE'
        }
      );

      plugin.id = plugin.id.toString();
      plug.PluginAPI.disable(plugin);
      plugin.enabled = false;
    },
    viewSettings: function (plugin) {
      window.parent.postMessage({
        action: 'view-settings',
        params: { pluginId: plugin.id }
      }, '*');
    },
    deletePlugin: function (plugin) {
      this.disablePlugin(plugin);
      window.plug.fetch(
        this.$root.getAPIEndpoint('plugins/' + plugin.id), {
          credentials: 'include',
          method: 'DELETE'
        }
      );

      const idx = this.plugins.indexOf(plugin);
      if (idx === -1) return;
      this.plugins.splice(idx, 1);
    },
    maybeSettings: function (plugin) {
      plugin.id = plugin.id.toString();
      window.plug.hasSettings(plugin).then(function (has) {
        plugin.hasSettings = has;
      });
    }
  },
  computed: {
    gamesWon: function () {
      return this.plugins.filter(function (game) {
        return game.status === 'won';
      }).length;
    },
    gamesLost: function () {
      return this.plugins.filter(function (game) {
        return game.status === 'lost';
      }).length;
    }
  },
  watch: {
    '$root.loggedInUser': function (loggedInUser) {
      if (!loggedInUser) return;
      this.updatePlugins();
    }
  }
};
