import * as urls from '../utils/urls';
import * as errors from '../constants/errors';
import * as tags from '../constants/tags';
import * as validate from '../utils/validate';

class Dialog {
	static counter = 1;
	static dialogs = {};

	constructor(params = {}) {
		this.init(params);
		this.update(params);
		this.register();
	}

	init(params) {
		if (this.id) return;
		if (params.id === 'settings') {
			this.id = params.id;
		} else {
			this.id = (this.constructor.counter++).toString();
		}
	}

	static get tag() {
		return tags.DIALOG;
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

	get title() {
		return this._title;
	}

	set title(title) {
		validate.ensureString(title);
		this.update({ title }, { validate: false });
	}

	get url() {
		return this._url;
	}

	set url(url) {
		validate.ensureString(url);
		url = urls.toAbsoluteURL(url);
		if (!/^(https?:)?\/\//.test(url)) {
			throw new Error(errors.URL_MUST_HTTP);
		}
		this.update({ url }, { validate: false });
	}

	get modal() {
		return this._modal;
	}

	set modal(modal) {
		validate.ensureBoolean(modal);
		this.update({ modal }, { validate: false });
	}

	get textColor() {
		return this._textColor;
	}

	set textColor(color) {
		validate.ensureString(color);
		this.update({ textColor: color }, { validate: false });
	}

	get backgroundColor() {
		return this._backgroundColor;
	}

	set backgroundColor(color) {
		validate.ensureString(color);
		this.update({ backgroundColor: color }, { validate: false });
	}

	get horizontalPos() {
		return this._horizontalPos;
	}

	set horizontalPos(pos) {
		if (['left', 'center', 'right'].indexOf(pos) === -1) {
			throw new Error('Value must be left, center or right');
		}
		this.update({ horizontalPos: pos }, { validate: false });
	}

	get verticalPos() {
		return this._verticalPos;
	}

	set verticalPos(pos) {
		if (['top', 'center', 'bottom'].indexOf(pos) === -1) {
			throw new Error('Value must be top, center or bottom');
		}
		this.update({ verticalPos: pos }, { validate: false });
	}

	get icon() {
		return this._icon;
	}

	set icon(icon) {
		this.update({ icon }, { validate: false });
	}

	get width() {
		return this._width;
	}

	set width(width) {
		this.update({ width }, { validate: false });
	}

	get height() {
		return this._height;
	}

	set height(height) {
		this.update({ height }, { validate: false });
	}

	static get(params) {
		if (!params) return;
		return Dialog.dialogs[params.id];
	}

	update(params, opts = {}) {
		if (!params) return false;
		const { validate = true } = opts;
		const keys = this.editableFields();
		let updated = false;
		for (const key in params) {
			errorIfNotEditable(this, key, keys, params);
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

	register() {
		Dialog.dialogs[this.id] = this;
	}

	editableFields() {
		return {
			title: 1, url: 1, modal: 1, textColor: 1, backgroundColor: 1,
			horizontalPos: 1, verticalPos: 1, width: 1, height: 1,
			onShow: 1, onHide: 1, onLoad: 1
		};
	}

	plain() {
		return {
			id: this.id, tag: this.tag,
			title: this.title, url: this.url, modal: this.modal,
			textColor: this.textColor, backgroundColor: this.backgroundColor,
			horizontalPos: this.horizontalPos, verticalPos: this.verticalPos,
			width: this.width, height: this.height
		};
	}
}
export default Dialog;

function errorIfNotEditable(dialog, key, keys, params) {
	if (!(key in keys) && dialog[key] !== params[key]) {
		// Whitelisted, OK
		if (key === 'id' && params[key] === 'settings') return;
		// Otherwise error
		throw new Error("Field '" + key + "' is not editable.");
	}
}
