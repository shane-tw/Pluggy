import * as actions from '../constants/actions';
import CommonDialog from '../common/dialog';

class Dialog extends CommonDialog {
	update(params, opts) {
		const updated = super.update(params, opts);
		if (!updated || this.updateTimer) return;
		this.updateTimer = new Promise((resolve, _reject) => {
			setTimeout(() => {
				delete this.updateTimer;
				window.parent.postMessage({
					action: actions.DIALOG_RENDER,
					params: this.plain()
				}, '*');
				resolve();
			}, 50);
		});
	}

	show() {
		setVisible(this, true);
		return this;
	}

	hide() {
		setVisible(this, false);
		return this;
	}

	editableFields() {
		return Object.assign({}, super.editableFields(), {
			onShow: 1, onHide: 1, onLoad: 1
		});
	}
}
export default Dialog;

function setVisible(dialog, visible) {
	const sendMessage = () => {
		window.parent.postMessage({
			action: actions.DIALOG_CALL,
			subAction: visible ? 'show' : 'hide',
			params: dialog.plain()
		}, '*');
	};

	if (dialog.updateTimer) {
		dialog.updateTimer.then(sendMessage);
	} else {
		sendMessage();
	}
}
