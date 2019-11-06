export default (el, s) => {
	do {
		const match = el.matches && el.matches(s);
		const matchMS = el.msMatchesSelector && el.msMatchesSelector(s);
		if (match || matchMS) return el;
		el = el.parentElement || el.parentNode;
	} while (el !== null && el.nodeType === 1);
	return null;
};
