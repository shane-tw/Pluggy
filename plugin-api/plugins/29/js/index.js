plug.init().then(function () {
	var sidebar = new plug.Section({ id: 'sidebar' });

	new plug.Button({
		section: sidebar, label: 'Export Boards',
		onClick: function () {
			cornerDialog.show();
		}
	});

	var cornerDialog = new plug.Dialog({
		modal: true, title: 'Loading', url: 'boards.html',
		backgroundColor: '#3B4B69', textColor: 'white',
		verticalPos: 'bottom', horizontalPos: 'right',
		height: '500px',
		onLoad: function () {
			this.title = 'Export Boards';
		},
		onShow: function () {
			plug.Store.set('dialog_shown', Date.now());
		}
	});

	var boardContext = new plug.Section({ id: 'board-context' });

	new plug.Button({
		section: boardContext, label: 'Export This Board',
		onClick: function (project) {
			plug.Store.set('project', project);
			cornerDialog.show();
		}
	})
});
