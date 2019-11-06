import Deferred from '../utils/deferred';
import * as actions from '../constants/actions';

class PermissionAPI {
	static request(permissions) {
		const deferred = new Deferred().register();
		window.parent.postMessage({
			action: actions.PERMISSION_GRANT_REQUEST,
			deferredId: deferred.id,
			params: { permissions }
		}, '*');
		return deferred;
	}
}
export default PermissionAPI;
