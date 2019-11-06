import * as urls from '../utils/urls';

const allowedMethods = ['*', 'GET', 'POST', 'PUT', 'DELETE'];

class Route {
	constructor(params = {}) {
		this.method = params.method;
		this.path = params.path;
	}

	get method() {
		return this._method;
	}

	set method(method) {
		const isString = (typeof method === 'string');
		if (isString) method = method.toUpperCase();
		if (method && allowedMethods.indexOf(method) === -1) {
			throw new Error('Invalid HTTP method given');
		}
		this._method = method;
	}

	get path() {
		return this._path;
	}

	set path(path) {
		if (typeof path === 'string') {
			path = urls.toRelativeURL(path);
		}
		this._path = path;
	}

	check(method, path) {
		path = urls.toRelativeURL(path).split('?')[0];
		if (typeof method === 'string') method = method.toUpperCase();
		const sameMethod = ['*', method].indexOf(this.method) > -1;
		let samePath;
		if (this.path instanceof RegExp) {
			samePath = this.path.test(path);
		} else {
			const thisPath = this.path.split('?')[0];
			samePath = ['*', thisPath].indexOf(path) > -1;
		}
		return (sameMethod && samePath);
	}
}
export default Route;
