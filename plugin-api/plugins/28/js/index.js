function updateDialogURL(dialog) {
	plug.Store.get('newsCategory').then(function (cat) {
		cat = cat || '';
		dialog.url = 'http://feeds.bbci.co.uk/news' + cat + '/rss.xml';
	});
}

plug.init().then(function () {
	var sidebar = new plug.Section({ id: 'sidebar' });

	var settingsDialog = new plug.Dialog({
		id: 'settings',
		width: '260px',
		height: '120px',
		modal: true,
		title: 'Settings',
		url: 'settings.html',
		verticalPos: 'center',
		horizontalPos: 'center'
	});

	var rssDialog = new plug.Dialog({
		title: 'BBC News - Loading',
		backgroundColor: 'grey',
		textColor: 'white',
		width: '600px',
		height: '100%',
		horizontalPos: 'right',
		onLoad: function () {
			this.title = 'BBC News - RSS';
		}
	});

	new plug.Button({
		section: sidebar,
		label: 'Show RSS Feed',
		onClick: function () {
			rssDialog.show();
		}
	});

	updateDialogURL(rssDialog);

	plug.Store.subscribe('savedSettings', function () {
		updateDialogURL(rssDialog);
		settingsDialog.hide();
	});
});
