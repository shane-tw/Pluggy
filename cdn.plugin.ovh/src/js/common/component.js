import * as errors from '../constants/errors';
import * as tags from '../constants/tags';

class Component {
	static counter = 1;

	constructor(params = {}) {
		this.init(params);
		this.update(params);
	}

	init(_params) {
		this.id = this.id || (this.constructor.counter++).toString();
	}

	static get tag() {
		return tags.COMPONENT;
	}

	get tag() {
		return this.constructor.tag;
	}

	get id() {
		return this._id;
	}

	set id(id) {
		if (this.id && this.id !== id) {
			throw new Error(errors.CANT_CHANGE_ID);
		}
		this._id = id;
	}

	get section() {
		return this._section;
	}

	set section(section) {
		const old = this.section;
		if (old === section) return;
		if (old) {
			throw new Error("Component can't change section once set");
		}
		this.update({ section }, { validate: false });
		section.addComponent(this);
	}

	update(params, opts = {}) {
		if (!params) return false;
		const { validate = true } = opts;
		const keys = this.editableFields();
		let updated = false;
		for (const key in params) {
			if (!(key in keys) && this[key] !== params[key]) {
				throw new Error("Field '" + key + "' is not editable.");
			}
			if (this[key] !== params[key]) {
				if (validate) {
					this[key] = params[key];
				} else {
					this['_' + key] = params[key];
				}
				updated = true;
			}
		}
		return updated;
	}

	editableFields() {
		return { section: 1 };
	}

	plain() {
		return {
			id: this.id, tag: this.tag,
			sectionId: this.section.id
		};
	}
}
export default Component;
