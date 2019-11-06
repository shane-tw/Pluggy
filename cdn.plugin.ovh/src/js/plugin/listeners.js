import Deferred from '../utils/deferred';
import Dialog from '../common/dialog';
import Section from '../common/section';
import * as actions from '../constants/actions';
import * as misc from '../constants/misc';
import * as tags from '../constants/tags';
import Store from './store';
import plug from '.';

window.addEventListener('message', evt => {
	if (!evt.data) return;
	const message = evt.data;
	const { action } = message;

	if (plug.debug) {
		/* eslint-disable no-console */
		console.log("Plugin with ID '" + plug.pluginId + "' received message");
		console.log(message);
		/* eslint-enable no-console */
	}

	switch (action) {
	case actions.BUTTON_CALLBACK:
		buttonCallback(message);
		break;
	case actions.DIALOG_CALLBACK:
		dialogCallback(message);
		break;
	case actions.FETCH_RESPONSE:
		fetchCallback(message);
		break;
	case actions.INIT_RESPONSE:
		initCallback(message);
		break;
	case actions.VIEW_SETTINGS:
		viewSettingsCallback(message);
		break;
	case actions.CHECK_SETTINGS_REQUEST:
		checkHasSettingsCallback(message);
		break;
	case actions.CHECK_SETTINGS_RESPONSE:
		checkHasSettingsResponse(message);
		break;
	case actions.STORE_GET_REQUEST:
		storeGetRequest(message);
		break;
	case actions.STORE_GET_RESPONSE:
		storeGetResponse(message);
		break;
	case actions.STORE_SET_REQUEST:
		storeSetRequest(message);
		break;
	case actions.STORE_VALUE_CHANGED:
		storeValueChanged(message);
		break;
	case actions.PERMISSION_GRANT_RESPONSE:
		permissionGrantResponse(message);
		break;
	case actions.GET_RENDER_PARAMS:
		getRenderParams(message);
		break;
	}
});

function getRenderParams(message) {
	const { params, deferredId } = message;
	const { component : componentParams, context } = params;
	const { sectionId } = componentParams;
	const section = Section.get({ id: sectionId });
	if (!section) return;

	const component = section.getComponent(componentParams);
	let renderParams = {};
	if (typeof component.render === 'function') {
		renderParams = component.render(context);
	}
	if (renderParams instanceof Promise || renderParams instanceof Deferred) {
		renderParams.then((res) => sendRender(res, deferredId));
	} else {
		sendRender(renderParams, deferredId);
	}
}

function sendRender(renderParams, deferredId) {
	window.parent.postMessage({
		action: actions.GET_RENDER_PARAMS,
		deferredId: deferredId,
		params: renderParams
	}, '*');
}

function buttonCallback(message) {
	const { params, subAction } = message;
	const { button : buttonParams, context } = params;
	const { sectionId } = buttonParams;
	const section = Section.get({ id: sectionId });
	if (!section) return;

	const button = section.getComponent(buttonParams);
	if (!button || button.tag !== tags.BUTTON) return;
	if (typeof button[subAction] === 'function') {
		if (misc.BUTTON_CALLBACKS.indexOf(subAction) === -1) return;
		button[subAction](context);
	}
}

function dialogCallback(message) {
	const { params, subAction } = message;
	const dialog = Dialog.get(params);
	if (!dialog || dialog.tag !== tags.DIALOG) return;
	if (typeof dialog[subAction] === 'function') {
		if (misc.DIALOG_CALLBACKS.indexOf(subAction) === -1) return;
		dialog[subAction]();
	}
}

function fetchCallback(message) {
	const { params, deferredId } = message;
	const { type, response, error } = params;
	const deferred = Deferred.getById(deferredId);
	if (!deferred) return;
	if (type === 'success') {
		handleFetchPromises(response);
		deferred.resolve(response);
	} else {
		deferred.reject(error);
	}
}

function initCallback(message) {
	const { params, deferredId } = message;
	const deferred = Deferred.getById(deferredId);
	if (!deferred) return;
	deferred.resolve(params);
}

function handleFetchPromises(response) {
	const { blob } = response;
	const types = ['blob', 'json', 'text', 'arrayBuffer'];
	for (let i = 0; i < types.length; i++) {
		const type = types[i];
		response[type] = () => getResponse(blob, type);
	}
}

function getResponse(blob, type) {
	return new Promise((resolve, reject) => {
		if (type === 'blob') {
			resolve(blob);
			return;
		}
		const fr = new FileReader();
		fr.onload = () => {
			let out = fr.result;
			if (type === 'json') {
				out = JSON.parse(out);
			}
			resolve(out);
		};
		fr.onerror = () => reject(fr.error);
		if(type == 'json' || type == 'text') {
			fr.readAsText(blob);
		} else if (type === 'arrayBuffer') {
			fr.readAsArrayBuffer(blob);
		}
	});
}

function viewSettingsCallback() {
	const settings = Dialog.get({ id: 'settings' });
	if (!settings) return;
	settings.show();
}

function checkHasSettingsCallback(message) {
	const { deferredId } = message;
	window.parent.postMessage({
		action: actions.CHECK_SETTINGS_RESPONSE,
		deferredId,
		params: {
			hasSettings: !!Dialog.get({ id: 'settings' })
		}
	}, '*');
}

function checkHasSettingsResponse(message) {
	const { params, deferredId } = message;
	const { hasSettings } = params;
	const deferred = Deferred.getById(deferredId);
	if (!deferred) return;
	deferred.resolve(hasSettings);
}

function storeGetRequest(message) {
	const { params, deferredId } = message;
	const { key } = params;
	plug.Store.get(key).then(value => {
		window.parent.postMessage({
			action: actions.STORE_GET_RESPONSE,
			deferredId,
			params: { value }
		}, '*');
	});
}

function storeGetResponse(message) {
	const { params, deferredId } = message;
	const { value } = params;
	const deferred = Deferred.getById(deferredId);
	if (!deferred) return;
	deferred.resolve(value);
}

function storeSetRequest(message) {
	const { params } = message;
	const { key, value } = params;
	plug.Store.set(key, value);
}

function storeValueChanged(message) {
	const { params } = message;
	const { key, oldValue, newValue } = params;
	if (!(key in Store.subscribers)) return;
	for (let i = 0; i < Store.subscribers[key].length; i++) {
		const subscriber = Store.subscribers[key][i];
		subscriber(newValue, oldValue);
	}
}

function permissionGrantResponse(message) {
	const { deferredId } = message;
	const deferred = Deferred.getById(deferredId);
	if (!deferred) return;
	deferred.resolve();
}
