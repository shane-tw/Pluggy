import * as actions from '../constants/actions';

class PermissionAPI {
	static request(permissions) {
		return new Promise((resolve, reject) => {
			const channel = new MessageChannel();
			channel.port1.onmessage = (e) => resolve(e.data);
			channel.port1.onmessageerror = (e) => reject(e.data);
			window.parent.postMessage({
				action: actions.PERMISSION_GRANT,
				params: { permissions }
			}, '*', [channel.port2]);
		});
	}
}
export default PermissionAPI;
