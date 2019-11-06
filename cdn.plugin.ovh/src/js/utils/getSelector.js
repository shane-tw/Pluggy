// Returns either of these selectors:
// - [data-ps-TYPE-id="ID"]	when ID specified
// - [data-ps-TYPE-id]		when ID not specified
export default (type, id) => {
	let out = '[data-ps-' + type + '-id';
	if (!id) return out + ']';
	return out + '="' + id + '"]';
};
