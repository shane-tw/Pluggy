import Dialog from './dialog';
import Deferred from '../utils/deferred';
import * as actions from '../constants/actions';

export default plugin => {
	const { id : pluginId } = plugin;
	if (!pluginId) {
		return new Promise((resolve, _reject) => {
			resolve(!!Dialog.get({ id: 'settings' }));
		});
	}
	const deferred = new Deferred().register();
	window.parent.postMessage({
		action: actions.CHECK_SETTINGS_REQUEST,
		deferredId: deferred.id,
		params: { pluginId }
	}, '*');
	return deferred;
};