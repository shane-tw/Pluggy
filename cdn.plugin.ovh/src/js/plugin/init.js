import Button from './button';
import Dialog from './dialog';
import Deferred from '../utils/deferred';
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
	const deferred = new Deferred().register();
	deferred.then(params => {
		const {
			debug, pluginId, domain,
			siteId, privileged, indirect
		} = params;
		Object.assign(plug, {
			debug, pluginId, domain, siteId, indirect,
			Deferred, Store, hasSettings, PermissionAPI,
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
	window.parent.postMessage({
		action: actions.INIT_REQUEST,
		deferredId: deferred.id
	}, '*');
	return deferred;
};
