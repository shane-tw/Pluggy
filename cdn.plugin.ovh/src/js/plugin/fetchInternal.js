import * as actions from '../constants/actions';

export default (url, options) => (
	new Promise((resolve, reject) => {
		const channel = new MessageChannel();
		channel.port1.onmessage = (e) => resolve(e.data);
		channel.port1.onmessageerror = (e) => reject(e.data)
		window.parent.postMessage({
			action: actions.FETCH,
			params: { url, options }
		}, '*', [channel.port2]);
	})
);
