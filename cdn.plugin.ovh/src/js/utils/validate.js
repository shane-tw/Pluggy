export const ensureString = val => {
	if (typeof val !== 'string') {
		throw new Error("Value must be of type 'string'");
	}
};

export const ensureFunction = val => {
	if (typeof val !== 'function') {
		throw new Error("Value must be of type 'function'");
	}
};

export const ensureBoolean = val => {
	if (typeof val !== 'boolean') {
		throw new Error("Value must be of type 'boolean'");
	}
};

export const ensureArray = val => {
	if (!(val instanceof Array)) {
		throw new Error("Value must be of type 'array'");
	}
};

export const ensureObject = val => {
	if (typeof val !== 'object') {
		throw new Error("Value must be of type 'object'");
	}
};
