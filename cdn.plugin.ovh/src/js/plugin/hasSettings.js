import Dialog from './dialog';
import * as actions from '../constants/actions';

export default plugin => {
	const { id : pluginId } = plugin;
	if (!pluginId) {
		return new Promise((resolve, _reject) => {
			resolve(!!Dialog.get({ id: 'settings' }));
		});
	}
	return new Promise((resolve, reject) => {
		const channel = new MessageChannel();
		channel.port1.onmessage = (e) => resolve(e.data);
		channel.port1.onmessageerror = (e) => reject(e.data);
		window.parent.postMessage({
			action: actions.CHECK_SETTINGS_REQUEST,
			params: { pluginId }
		}, '*', [channel.port2]);
	});
};