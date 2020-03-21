import Button from './button';
import Dialog from './dialog';
import Section from './section';
import Widget from './widget';
import fetchInternal from './fetchInternal';
import hasSettings from './hasSettings';
import Store from './store';
import PluginAPI from './pluginAPI';
import * as actions from '../constants/actions';
import fetch from '../utils/fetch';
import PermissionAPI from './permissionAPI';
import plug from '.';

export default () => {
	delete plug.init;

	const promise = new Promise((resolve, reject) => {
		const channel = new MessageChannel();
		channel.port1.onmessage = (e) => resolve(e.data);
		channel.port1.onmessageerror = (e) => reject(e.data);
		window.parent.postMessage({
			action: actions.INIT,
		}, '*', [channel.port2]);
	});

	promise.then(params => {
		const {
			debug, pluginId, domain,
			siteId, privileged, indirect
		} = params;

		Object.assign(plug, {
			debug, pluginId, domain, siteId, indirect,
			Store, hasSettings, PermissionAPI,
			fetch, fetchInternal, Promise
		});
		// If either plugin is privileged or
		// not running from a plugin-created widget/dialog (aka indirectly)
		if (privileged || !indirect) {
			Object.assign(plug, {
				Button, Widget, Dialog, Section
			});
		}
		// Only if plugin is privileged
		if (privileged) {
			Object.assign(plug, {
				PluginAPI
			});
		}
	});

	return promise;
};
