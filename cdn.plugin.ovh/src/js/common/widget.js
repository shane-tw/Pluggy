import * as tags from '../constants/tags';
import * as validate from '../utils/validate';
import * as urls from '../utils/urls';
import * as errors from '../constants/errors';

export default sup => class Widget extends sup {
	static get tag() {
		return tags.WIDGET;
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

	editableFields() {
		return Object.assign({}, super.editableFields(), {
			url: 1
		});
	}

	plain() {
		return Object.assign({}, super.plain(), {
			url: this.url
		});
	}
};
