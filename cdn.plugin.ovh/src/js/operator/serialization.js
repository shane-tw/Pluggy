export const serializeResponse = res => {
	if (!res || !res.text) return {};
	return res.blob().then(blob => {
		return {
			blob: blob, ok: res.ok,
			status: res.status, statusText: res.statusText,
			redirected: res.redirected, type: res.type,
			url: res.url, bodyUsed: res.bodyUsed
		};
	});
};

export const serializeError = err => {
	if (!err) return {};
	const { name, message } = err;
	return { name, message };
};
