import * as tags from '../constants/tags';
import * as validate from '../utils/validate';

export default sup => class Button extends sup {
	static get tag() {
		return tags.BUTTON;
	}

	get label() {
		return this._label;
	}

	set label(label) {
		validate.ensureString(label);
		this.update({ label }, { validate: false });
	}

	get icon() {
		return this._icon;
	}

	set icon(icon) {
		validate.ensureString(icon);
		this.update({ icon }, { validate: false });
	}

	get onClick() {
		return this._onClick;
	}

	set onClick(onClick) {
		validate.ensureFunction(onClick);
		this.update({ onClick }, { validate: false });
	}

	editableFields() {
		return Object.assign({}, super.editableFields(), {
			label: 1, icon: 1, onClick: 1
		});
	}

	plain() {
		return Object.assign({}, super.plain(), {
			label: this.label, icon: this.icon
		});
	}
};
