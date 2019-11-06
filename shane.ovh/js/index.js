plug.siteId = 6;

plug.PermissionAPI.add([
	new plug.Permission({
		id: 'viewUsers', name: 'Users',
		description: 'Access user accounts',
		routes: [
			new plug.Route({ method: '*', path: '/api/v1/users' }),
			new plug.Route({ method: 'GET', path: '/api/v1/users' })
		],
		grantable: true,
		alwaysGranted: false
	})
]);

var sidebar = new plug.Section({ id: 'sidebar' });
var other = new plug.Section({ id: 'other' });

sidebar.setRenderOverride(plug.Button, function (root) {
	if (!root) {
		root = document.createElement('button');
		root.addEventListener('click', this.handleClick.bind(this));
	}
	root.innerText = this.label + ' HOOKED';
	return root;
});

// Testing MutationObserver by creating a section dynamically
setTimeout(function () {
	var div = document.createElement('div');
	div.dataset.psSectionId = 'sidebar';
	document.body.appendChild(div);
}, 5000);
