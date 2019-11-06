import CommonComponent from '../common/component';
import * as actions from '../constants/actions';

class Component extends CommonComponent {
	update(params, opts) {
		const updated = super.update(params, opts);
		const { section, updateTimer } = this;
		if (!section || !section.registered) return;
		if (!updated || updateTimer) return;
		this.updateTimer = new Promise((resolve, _reject) => {
			setTimeout(() => {
				delete this.updateTimer;
				window.parent.postMessage({
					action: actions.COMPONENT_RENDER,
					params: this.plain()
				}, '*');
				resolve();
			}, 50);
		});
	}

	editableFields() {
		return Object.assign({}, super.editableFields(), {
			render: 1
		});
	}
}
export default Component;
