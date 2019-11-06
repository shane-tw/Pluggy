import * as errors from '../constants/errors';
import * as misc from '../constants/misc';

class Plugin {
	static counter = 1;
	static plugins = {};

	static get(params) {
		if (!params) return;
		if (params instanceof Plugin) {
			return params;
		}
		const pluginId = params.pluginId || params.id;
		return Plugin.plugins[pluginId];
	}

	constructor(params = {}) {
		this.init(params);
	}

	init(params) {
		this.id = params.id || (this.constructor.counter++).toString();
		this.url = params.url;
		this.privileged = params.privileged;
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

	get url() {
		return this._url;
	}

	set url(url) {
		this._url = url;
	}

	get name() {
		return this._name;
	}

	set name(name) {
		this._name = name;
	}

	get description() {
		return this._description;
	}

	set description(description) {
		this._description = description;
	}

	get enabled() {
		return this._enabled;
	}

	set enabled(enabled) {
		this._enabled = enabled;
	}

	get privileged() {
		return this._privileged;
	}

	set privileged(privileged) {
		this._privileged = privileged;
	}

	render(holder) {
		if (!holder) {
			const sel = document.getElementById(misc.PLUGIN_HOLDER_ID);
			holder = sel || document.body;
		}
		const iframe = document.createElement('iframe');
		iframe.dataset.psPluginId = this.id;
		iframe.sandbox = 'allow-scripts allow-same-origin';
		iframe.src = this.url || ('http://' + this.id + '.plugin.ovh:4040/');
		iframe.style.display = 'none';
		holder.appendChild(iframe);
		this._elem = iframe;
	}

	register() {
		Plugin.plugins[this.id] = this;
		return this;
	}
}
export default Plugin;
