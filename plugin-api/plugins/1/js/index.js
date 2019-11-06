plug.init().then(function () {
	var sidebar = new plug.Section({ id: 'sidebar' });

	new plug.Button({
		section: sidebar,
		label: 'Manage Plugins',
		onClick: function () {
			manageModal.show();
		}
	});

	var manageModal = new plug.Dialog({
		title: 'Manage Plugins', url: 'http://plugin.ovh:8135/',
		backgroundColor: '#3b4b69', textColor: 'white',
		modal: true, width: '1100px', height: '100%'
	});

	enablePlugins();
	window.plug.Store.subscribe('logged_in', enablePlugins);
});

function enablePlugins() {
	retrievePlugins().then(function (res) {
		var plugins = res.plugins;
		if (!plugins) return;
		for (var i = 0; i < plugins.length; i++) {
			var plugin = plugins[i];
			plug.PluginAPI.enable(plugin);
		}
	});
}

function retrievePlugins() {
	var d = new plug.Deferred();
	plug.fetch('http://plugin.ovh:4040/api/v1/sites/' +
				plug.siteId + '/users/me/plugins', {
		credentials: 'include'
	}).then(function (r) {
		return r.json();
	}).then(function (j) {
		d.resolve(j);
	}).catch(function (e) {
		d.reject(e);
	});
	return d;
}
