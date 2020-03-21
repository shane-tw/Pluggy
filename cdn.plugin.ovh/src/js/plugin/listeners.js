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
		buttonCallback(evt);
		break;
	case actions.DIALOG_CALLBACK:
		dialogCallback(evt);
		break;
	case actions.VIEW_SETTINGS:
		viewSettings(evt);
		break;
	case actions.CHECK_SETTINGS:
		checkHasSettings(evt);
		break;
	case actions.STORE_GET:
		storeGetRequest(evt);
		break;
	case actions.STORE_SET:
		storeSetRequest(evt);
		break;
	case actions.STORE_VALUE_CHANGED:
		storeValueChanged(evt);
		break;
	case actions.GET_RENDER_PARAMS:
		getRenderParams(evt);
		break;
	}
});

function buttonCallback({data : message}) {
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

function dialogCallback({data : message}) {
	const { params, subAction } = message;
	const dialog = Dialog.get(params);
	if (!dialog || dialog.tag !== tags.DIALOG) return;
	if (typeof dialog[subAction] === 'function') {
		if (misc.DIALOG_CALLBACKS.indexOf(subAction) === -1) return;
		dialog[subAction]();
	}
}

function viewSettings() {
	const settings = Dialog.get({ id: 'settings' });
	if (!settings) return;
	settings.show();
}

function checkHasSettings({ports}) {
	const hasSettings = !!Dialog.get({ id: 'settings' });
	ports[0].postMessage(hasSettings);
}

function storeGetRequest({data : message, ports}) {
	const { params } = message;
	const { key } = params;
	plug.Store.get(key).then(value => {
		ports[0].postMessage({
			params: { value }
		});
	});
}

function storeSetRequest({data : message}) {
	const { params } = message;
	const { key, value } = params;
	plug.Store.set(key, value);
}

function storeValueChanged({data : message}) {
	const { params } = message;
	const { key, oldValue, newValue } = params;
	if (!(key in Store.subscribers)) return;
	for (let i = 0; i < Store.subscribers[key].length; i++) {
		const subscriber = Store.subscribers[key][i];
		subscriber(newValue, oldValue);
	}
}

function getRenderParams({data : message, ports}) {
	const { params } = message;
	const { component : componentParams, context } = params;
	const { sectionId } = componentParams;
	const section = Section.get({ id: sectionId });
	if (!section) return;

	const component = section.getComponent(componentParams);
	let renderParams = {};
	if (typeof component.render === 'function') {
		renderParams = component.render(context);
	}
	if (renderParams instanceof Promise) {
		renderParams.then((res) => {
			ports[0].postMessage(res);
		});
	} else {
		ports[0].postMessage(renderParams);
	}
}
