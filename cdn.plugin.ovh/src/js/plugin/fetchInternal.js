import Deferred from '../utils/deferred';
import * as actions from '../constants/actions';

export default (url, options) => {
	const deferred = new Deferred().register();
	window.parent.postMessage({
		action: actions.FETCH_REQUEST,
		deferredId: deferred.id,
		params: { url, options }
	}, '*');
	return deferred;
};
