export const toAbsoluteURL = relative => {
	const anchor = document.createElement('a');
	anchor.href = relative;
	anchor.href += ''; // IE11 :(
	return anchor.href;
};

export const toRelativeURL = absolute => {
	const currentLoc = document.location;
	const anchor = document.createElement('a');
	anchor.href = absolute;
	anchor.href += ''; // IE11 :(
	const newLoc = anchor;
	const protocolDiffers = (currentLoc.protocol !== newLoc.protocol);
	const hostDiffers = (currentLoc.host !== newLoc.host);
	if (protocolDiffers || hostDiffers) {
		return anchor.href;
	}
	if (newLoc.pathname[0] !== '/') {
		return '/' + newLoc.pathname;
	}
	return newLoc.pathname;
};
