import { serializeResponse, serializeError } from './serialization';
import PluginAPI from './pluginAPI';
import Plugin from './plugin';
import Dialog from './dialog';
import * as urls from '../utils/urls';
import Button from './button';
import Widget from './widget';
import Section from './section';
import * as actions from '../constants/actions';
import * as misc from '../constants/misc';
import * as tags from '../constants/tags';
import * as errors from '../constants/errors';
import getSelector from '../utils/getSelector';
import { getPluginFrame } from './elems';
import fetch from '../utils/fetch';
import closest from '../utils/closest';
import plug from '.';
import PermissionAPI from './permissionAPI';

window.addEventListener('message', evt => {
	if (!evt.data) return;
	const message = evt.data;
	const { params, action } = message;

	if (plug.debug) {
		/* eslint-disable no-console */
		console.log('Operator received message:');
		console.log(message);
		/* eslint-enable no-console */
	}

	const srcFrame = getFrameByWindow(evt.source);
	if (!srcFrame) return;
	const pluginElem = closest(srcFrame, getSelector('plugin'));
	if (!pluginElem) return;
	let plugin = Plugin.get({ id: pluginElem.dataset.psPluginId });
	if (!plugin) return;
	message.plugin = plugin;
	plugin.indirect = (srcFrame.parentElement.id !== misc.PLUGIN_HOLDER_ID);

	// Any plugins or plugin-created dialogs can perform these
	switch (action) {
	case actions.INIT:
		handleInit(evt);
		break;
	case actions.STORE_GET:
		storeGetRequest(evt);
		break;
	case actions.STORE_SET:
		storeSetRequest(evt);
		break;
	case actions.STORE_VALUE_CHANGED:
		storeValueChanged(message, srcFrame);
		break;
	case actions.FETCH:
		fetchRequest(evt);
		break;
	case actions.PERMISSION_GRANT:
		permissionGrantRequest(evt);
		break;
	}

	// A privileged plugin and its dialogs can perform these actions
	if (plugin.privileged) {
		switch (action) {
		case actions.PLUGIN_ENABLE:
			PluginAPI.enable(params);
			break;
		case actions.PLUGIN_DISABLE:
			PluginAPI.disable(params);
			break;
		case actions.PLUGIN_DISABLE_ALL:
			PluginAPI.disableAll(params);
			break;
		case actions.VIEW_SETTINGS:
			viewSettingsRequest(message);
			break;
		case actions.CHECK_SETTINGS_REQUEST:
			checkSettingsRequest(message, srcFrame);
			break;
		}
	}

	if (!plugin.indirect || plugin.privileged) {
		// Any plugin can perform these actions (dialogs can't)
		switch (action) {
		case actions.SECTION_REGISTER:
			registerSection(message);
			break;
		case actions.COMPONENT_RENDER:
			updateComponent(message);
			break;
		case actions.DIALOG_RENDER:
			updateDialog(message);
			break;
		case actions.DIALOG_CALL:
			dialogCall(message);
			break;
		}
	}
});

if (['interactive','complete'].indexOf(document.readyState) > -1) {
	onPageLoad();
} else {
	window.addEventListener('DOMContentLoaded', () => {
		onPageLoad();
	});
}

function onPageLoad() {
	const holderFragment = document.createElement('div');

	const pluginHolder = document.createElement('div');
	pluginHolder.id = misc.PLUGIN_HOLDER_ID;
	holderFragment.appendChild(pluginHolder);

	const dialogHolder = document.createElement('div');
	dialogHolder.id = misc.DIALOG_HOLDER_ID;
	holderFragment.appendChild(dialogHolder);

	document.body.appendChild(holderFragment);

	PluginAPI.enable({ id: '1', privileged: true });

	new MutationObserver(mutations => {
		for (let i = 0; i < mutations.length; i++) {
			const mutation = mutations[i];
			const { addedNodes } = mutation;
			for (let j = 0; j < addedNodes.length; j++) {
				let node = addedNodes[j];
				if (!node.dataset) continue;
				let nodes = [node];
				if (!node.dataset.psSectionId) {
					nodes = node.querySelectorAll(getSelector('section'));
				}
				renderSections(nodes);
			}
		}
	}).observe(document.body, { childList: true, subtree: true });
}

function renderSections(nodes) {
	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i];
		const sectionId = node.dataset.psSectionId;
		const section = Section.get({ id: sectionId });
		if (!section) continue;
		section.render(node);
	}
}

function getFrameByWindow(srcWindow, holder) {
	holder = holder || document.body;
	if (!holder) return;
	const frames = holder.querySelectorAll('iframe');
	for (let i = 0; i < frames.length; i++) {
		const frame = frames[i];
		if (frame.contentWindow === srcWindow) {
			return frame;
		}
	}
}

function createComponent(params) {
	let component;
	switch (params.tag) {
	case tags.BUTTON:
		component = new Button(params);
		break;
	case tags.WIDGET:
		component = new Widget(params);
		break;
	}
	return component;
}

function registerSection(message) {
	const { plugin, params } = message;
	const { components } = params;
	params.plugin = plugin;
	const section = Section.get(params);
	if (!section) return;
	for (let i = 0; i < components.length; i++) {
		const compParams = components[i];
		delete compParams.sectionId;
		compParams.plugin = plugin;
		const component = createComponent(compParams);
		if (!component) continue;
		section.addComponent(component);
	}
	section.render();
}

function updateComponent(message) {
	const { plugin, params } = message;
	const { sectionId } = params;
	params.plugin = plugin;
	delete params.sectionId;
	const section = Section.get({ id: sectionId });
	if (!section) return;
	let component = section.getComponent(params);
	if (component) { // Already exists, update
		component.update(params);
		return;
	}
	component = createComponent(params);
	if (!component) return;
	section.addComponent(component);
	section.render(null, component);
}

function updateDialog(message) {
	const { plugin, params } = message;
	params.plugin = plugin;
	let dialog = Dialog.get(params);
	if (dialog) {
		dialog.update(params);
		return;
	}
	dialog = new Dialog(params);
}

function dialogCall(message) {
	const { plugin, params, subAction } = message;
	params.plugin = plugin;
	const dialog = Dialog.get(params);
	if (!dialog) return;
	if (typeof dialog[subAction] === 'function') {
		if (misc.DIALOG_ACTIONS.indexOf(subAction) === -1) return;
		dialog[subAction]();
	}
}

function fetchRequest(message) {
	const { plugin, params } = message;
	let { url, options = {} } = params;
	const { method = 'GET' } = options;
	url = urls.toAbsoluteURL(url);

	const canAccess = plug.PermissionAPI.canAccessRoute({ plugin, path: url, method });
	if (!canAccess) {
		postFetchError(new Error(errors.URL_MUST_INTERNAL), ports);
		return;
	}

	const errorBind = (err) => postFetchError(err, ports);
	fetch(url, options).then(res => {
		serializeResponse(res).then(obj => {
			ports[0].postMessage({
				type: 'success',
				response: obj
			});
		}).catch(errorBind);
	}).catch(errorBind);
}

function postFetchError(err, ports) {
	ports[0].postMessage({
		type: 'error',
		error: serializeError(err)
	});
}

function handleInit(message) {
	const { plugin } = message;
	ports[0].postMessage({
		debug: plug.debug,
		siteId: plug.siteId,
		pluginId: plugin.id,
		domain: window.location.hostname,
		privileged: plugin.privileged,
		indirect: plugin.indirect
	});
}

function storeGetRequest(message) {
	const { plugin, params } = message;
	const { key } = params;
	const pluginFrame = plugin._elem;
	if (!pluginFrame) return;

	const corePluginQuery = new Promise((resolve, reject) => {
		const channelCore = new MessageChannel();
		channelCore.port1.onmessage = (e) => resolve(e.data);
		channelCore.port2.onmessageerror = (e) => reject(e.data);

		pluginFrame.contentWindow.postMessage({
			action: actions.STORE_GET,
			params: { key }
		}, '*', [channelCore.port2]);
	});

	corePluginQuery.then(value => {
		ports[0].postMessage(value);
	});
}

function storeSetRequest(message) {
	const { plugin, params } = message;
	const { key, value } = params;
	const pluginFrame = plugin._elem;
	pluginFrame.contentWindow.postMessage({
		action: actions.STORE_SET,
		params: { key, value }
	}, '*');
}

function storeValueChanged(message, srcFrame) {
	const { plugin, params } = message;
	const { key, oldValue, newValue } = params;
	const pluginSelect = getSelector('plugin', plugin.id);
	const frames = document.querySelectorAll('iframe' + pluginSelect);
	for (let i = 0; i < frames.length; i++) {
		const frame = frames[i];
		if (frame === srcFrame) continue;
		frame.contentWindow.postMessage({
			action: actions.STORE_VALUE_CHANGED,
			params: { key, oldValue, newValue }
		}, '*');
	}
}

function viewSettingsRequest(message) {
	const { params } = message;
	const { pluginId } = params;
	const pluginFrame = getPluginFrame({ id: pluginId });
	if (!pluginFrame) return;
	pluginFrame.contentWindow.postMessage({
		action: actions.VIEW_SETTINGS
	}, '*');
}

function checkSettingsRequest(message) {
	const { params } = message;
	const { pluginId } = params;
	const pluginFrame = getPluginFrame({ id: pluginId });
	if (!pluginFrame) return;

	const corePluginQuery = new Promise((resolve, reject) => {
		const channelCore = new MessageChannel();
		channelCore.port1.onmessage = (e) => resolve(e.data);
		channelCore.port2.onmessageerror = (e) => reject(e.data);

		pluginFrame.contentWindow.postMessage({
			action: actions.CHECK_SETTINGS_REQUEST
		}, '*', [channelCore.port2]);
	});

	corePluginQuery.then(hasSettings => {
		ports[0].postMessage(hasSettings);
	});
}

function permissionGrantRequest(message) {
	const { plugin, params } = message;
	const { permissions = [] } = params;
	for (let i = 0; i < permissions.length; i++) {
		const params = permissions[i];
		const permission = PermissionAPI.get(params);
		if (!permission) continue;
		permission.grant(plugin);
	}
	ports[0].postMessage(null);
}
