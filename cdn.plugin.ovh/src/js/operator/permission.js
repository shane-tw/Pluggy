import * as validate from '../utils/validate';

class Permission {
	_plugins = {};

	constructor(params = {}) {
		this.init(params);
	}

	init(params) {
		this.id = params.id;
		this.name = params.name;
		this.description = params.description;
		this.routes = params.routes || [];
		this.grantable = params.grantable || true;
		this.alwaysGranted = params.alwaysGranted || false;
	}

	get id() {
		return this._id;
	}

	set id(id) {
		if (typeof id !== 'string' || !id.match(/^[a-zA-Z_-]+$/)) {
			throw new Error(
				'Permission id must only contain a-z, ' +
				'underscore (_) or hyphen (-), e.g. view-users'
			);
		}
		this._id = id;
	}

	get name() {
		return this._name;
	}

	set name(name) {
		this._name = name;
	}

	get description() {
		return this._description;
	}

	set description(description) {
		this._description = description;
	}

	get routes() {
		return this._routes;
	}

	set routes(routes) {
		validate.ensureArray(routes);
		this._routes = routes;
	}

	get grantable() {
		if (typeof this._grantable === 'function') {
			return !!this._grantable();
		}
		return !!this._grantable;
	}

	set grantable(grantable) {
		this._grantable = grantable;
	}

	get alwaysGranted() {
		if (typeof this._alwaysGranted === 'function') {
			return !!this._alwaysGranted();
		}
		return !!this._alwaysGranted;
	}

	set alwaysGranted(alwaysGranted) {
		this._alwaysGranted = alwaysGranted;
	}

	grant(plugin) {
		if (!this.grantable) return false;
		this._plugins[plugin.id] = true;
	}

	isGranted(plugin) {
		return !!(this.alwaysGranted || this._plugins[plugin.id]);
	}
}
export default Permission;

/*
viewUsersPerm.alwaysGranted = () => {
	app.loggedInUser.permissions.canViewPeople()
};
viewUsersPerm.grant(plugin);
viewUsersPerm.isGranted(plugin);
*/
