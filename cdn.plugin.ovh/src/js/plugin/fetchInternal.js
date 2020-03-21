import * as actions from '../constants/actions';

function getResponse(blob, type) {
	return new Promise((resolve, reject) => {
		if (type === 'blob') {
			resolve(blob);
			return;
		}
		const fr = new FileReader();
		fr.onload = () => {
			let out = fr.result;
			if (type === 'json') {
				out = JSON.parse(out);
			}
			resolve(out);
		};
		fr.onerror = () => reject(fr.error);
		if(type == 'json' || type == 'text') {
			fr.readAsText(blob);
		} else if (type === 'arrayBuffer') {
			fr.readAsArrayBuffer(blob);
		}
	});
}

function handleFetchPromises(response) {
	const { blob } = response;
	const types = ['blob', 'json', 'text', 'arrayBuffer'];
	for (let i = 0; i < types.length; i++) {
		const type = types[i];
		response[type] = () => getResponse(blob, type);
	}
}

export default (url, options) => (
	new Promise((resolve, reject) => {
		const channel = new MessageChannel();
		channel.port1.onmessage = (e) => {
			const { type, response, error } = e.data;
			if (type === 'success') {
				handleFetchPromises(response);
				resolve(response);
			} else {
				reject(error);
			}
		};
		channel.port1.onmessageerror = (e) => reject(e.data);
		window.parent.postMessage({
			action: actions.FETCH,
			params: { url, options }
		}, '*', [channel.port2]);
	})
);
