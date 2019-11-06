function onSave() {
	var seen = !!document.getElementById('seenModal').checked;
    plug.Store.set('seenModal', seen);
    plug.Store.set('savedSettings', Date.now());
}

plug.init().then(function () {
	plug.Store.get('seenModal').then(function (seen) {
		document.getElementById('seenModal').checked = seen;
	});
});
