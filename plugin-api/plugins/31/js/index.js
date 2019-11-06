plug.init().then(function () {
	plug.PermissionAPI.request([
		{ id: 'viewUsers' }
	]).then(main);
});

function main() {
	var sidebar = new plug.Section({ id: 'sidebar' });
	var other = new plug.Section({ id: 'other' });

	new plug.Button({
		label: 'Add Crayon', section: sidebar,
		onClick: function () {
			var url;
			// We're dealing with Trello
			if (plug.siteId === 8) {
				url = '/1/Members/me?' + serialize(trelloQuery)
			} else {
				return;
			}
			plug.fetchInternal(
				url
			).then(function (r) {
				return r.json();
			}).then(function (json) {
				plug.Store.set('users', json);
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
	}, 2000);
}

function serialize(obj) {
    var str = [];
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    }
    return str.join("&");
}

var trelloQuery = {
    boards: 'open,starred',
    board_fields: 'name,closed,dateLastActivity,dateLastView,datePluginDisable,idOrganization,prefs,shortLink,shortUrl,url,creationMethod',
    boardStars: true,
    organizations: 'all',
    organization_fields: 'name,displayName,products,prefs,logoHash,idEnterprise,tags,limits',
    board_organization: true,
    board_organization_fields: 'name,displayName,products,prefs,logoHash,idEnterprise,tags,limits',
    board_myPermLevel: true,
    board_memberships: 'me'
}
