plug.init().then(function () {
	var newsletterDialog = new plug.Dialog({
		modal: true, title: 'Email Newsletter', url: 'newsletter.html',
		backgroundColor: '#3B4B69', textColor: 'white',
		verticalPos: 'center', horizontalPos: 'center',
		width: '400px', height: '300px',
		onHide: function () {
			plug.Store.set('seenModal', true);
		}
	});
	
	var settingsDialog = new plug.Dialog({
		id: 'settings',
		width: '260px',
		height: '90px',
		modal: true,
		title: 'Settings',
		url: 'settings.html',
		verticalPos: 'center',
		horizontalPos: 'center'
	});

	plug.Store.get('seenModal').then(function (seen) {
		if (seen) return;
		newsletterDialog.show();
	});

	plug.Store.subscribe('savedSettings', () => {
		settingsDialog.hide();
	});
});
