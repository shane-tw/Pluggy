import * as actions from '../constants/actions';
import * as validate from '../utils/validate';

class PluginAPI {
	_userId = 0;

	static enable(params) {
		validate.ensureObject(params);
		const { id, url } = params;
		window.parent.postMessage({
			action: actions.PLUGIN_ENABLE,
			params: { id, url }
		}, '*');
	}

	static disable(params) {
		validate.ensureObject(params);
		const { id } = params;
		window.parent.postMessage({
			action: actions.PLUGIN_DISABLE,
			params: { id }
		}, '*');
	}

	static disableAll(params = {}) {
		const { exclude } = params;
		window.parent.postMessage({
			action: actions.PLUGIN_DISABLE_ALL,
			params: { exclude }
		}, '*');
	}

	get userId() {
		return this._userId;
	}

	set userId(id) {
		window.parent.postMessage({
			action: actions.PLUGIN_SET_USER_ID,
			params: { id }
		});
		this._userId = id;
	}
}
export default PluginAPI;
