function onSave() {
	var cat = document.getElementById('newsCategory').value;
	plug.Store.set('newsCategory', cat);
	plug.Store.set('savedSettings', Date.now());
}

plug.init().then(function () {
	plug.Store.get('newsCategory').then(function (cat) {
		cat = cat || '';
		document.getElementById('newsCategory').value = cat;
	});
});
