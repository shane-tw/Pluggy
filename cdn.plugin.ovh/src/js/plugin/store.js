import * as validate from '../utils/validate';
import * as actions from '../constants/actions';
import plug from '.';

function getStoreKey(key) {
	validate.ensureString(key);
	if (key.substring(0, 5) === 'plug:') {
		return key;
	}
	return 'plug:' + plug.pluginId + ':' + key;
}

function getParsedValue(val) {
	if (val === 'undefined') {
		return undefined;
	}
	try {
		return JSON.parse(val);
	} catch {
		return undefined;
	}
}

class Store {
	static subscribers = {};

	static set(key, newValue) {
		const deferred = new Deferred();
		deferred.then(params => {
			const { oldValue, newValue } = params;
			if (!(key in this.subscribers)) return;
			for (let i = 0; i < this.subscribers[key].length; i++) {
				const subscriber = this.subscribers[key][i];
				subscriber(newValue, oldValue);
			}
		});
		this.get(key).then(oldValue => {
			key = getStoreKey(key);
			if (plug.indirect) {
				window.parent.postMessage({
					action: actions.STORE_SET_REQUEST,
					params: { key, value: newValue }
				}, '*');
			} else {
				window.localStorage.setItem(key, JSON.stringify(newValue));
				window.parent.postMessage({
					action: actions.STORE_VALUE_CHANGED,
					params: { key, oldValue, newValue }
				}, '*');
				deferred.resolve({ oldValue, newValue });
			}
		});
		return deferred;
	}

	static get(key) {
		key = getStoreKey(key);
		if (!plug.indirect) {
			const val = window.localStorage.getItem(key);
			return Promise.resolve(getParsedValue(val));
		}
		return new Promise((resolve, reject) => {
			const channel = new MessageChannel();
			channel.port1.onmessage = (e) => resolve(e.data);
			channel.port2.onmessageerror = (e) => reject(e.data);

			window.parent.postMessage({
				action: actions.STORE_GET,
				params: { key }
			}, '*', [channel.port2]);
		});
	}

	static subscribe(key, callback) {
		key = getStoreKey(key);
		if (!(key in this.subscribers)) {
			this.subscribers[key] = [];
		}
		this.subscribers[key].push(callback);
	}

	static unsubscribe(key, callback) {
		key = getStoreKey(key);
		if (!(key in this.subscribers)) return;
		const idx = this.subscribers[key].indexOf(callback);
		if (idx === -1) return;
		this.subscribers[key].splice(idx, 1);
	}
}

export default Store;
