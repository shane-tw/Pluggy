import Deferred from '../utils/deferred';
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
		const deferred = new Deferred();
		key = getStoreKey(key);
		if (plug.indirect) {
			deferred.register();
			window.parent.postMessage({
				action: actions.STORE_GET_REQUEST,
				deferredId: deferred.id,
				params: { key }
			}, '*');
			return deferred;
		}
		const val = window.localStorage.getItem(key);
		deferred.resolve(getParsedValue(val));
		return deferred;
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
