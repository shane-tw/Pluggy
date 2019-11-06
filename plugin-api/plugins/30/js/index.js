plug.init().then(function () {
	var sidebar = new plug.Section({ id: 'task-sidebar' });
	var milestoneBody = new plug.Section({ id: 'milestone-body' });

	new plug.Button({
		label: 'Context testing', section: sidebar,
		onClick: function (context) {
			plug.Store.set('task', context);
			cornerDialog.show();
		}
	});

	var cornerDialog = new plug.Dialog({
		modal: true, title: 'Loading', url: 'context.html',
		backgroundColor: '#3B4B69', textColor: 'white',
		verticalPos: 'center', horizontalPos: 'center',
		height: '200px',
		onLoad: function () {
			this.title = 'Task Details';
		}
	});

	new plug.Button({
		section: sidebar,
		render: function (task) {
			return {
				label: task.name
			}
		}
	});

	new plug.Button({
		section: milestoneBody,
		render: function (milestone) {
			return {
				label: milestone.title
			}
		},
		onClick: function (milestone) {
			console.log(milestone);
		}
	});
});
