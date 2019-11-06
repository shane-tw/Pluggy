plug.init().then(function () {
	plug.PermissionAPI.request([
		{ id: 'viewUsers' }
	]).then(main);
});

function main() {
	var sidebar = new plug.Section({ id: 'sidebar' });
	var other = new plug.Section({ id: 'other' });

	var addPluginBtn = new plug.Button({
		label: 'Add Plugin', section: sidebar,
		onClick: function() {
			alert('Adding a plugin');
		}
	});

	new plug.Button({
		label: 'Add Crayon', section: sidebar,
		onClick: function () {
			plug.fetchInternal(
				'/api/v1/users'
			).then(function (r) {
				return r.json();
			}).then(function (json) {
				cornerDialog.show();
			});
		}
	});

	new plug.Button({
		label: 'Add Other', section: other,
		onClick: function () {
			alert(document.location);
		}
	});

	var cornerDialog = new plug.Dialog({
		modal: true, title: 'Hello world 123', url: 'corner.html',
		backgroundColor: '#3B4B69', textColor: 'white',
		verticalPos: 'bottom', horizontalPos: 'right'
	});

	setTimeout(function () {
		cornerDialog.title = 'Changed';
		addPluginBtn.label = 'Changed Label';
	}, 2000);
}
