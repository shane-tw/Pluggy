const _permissions = [];

class PermissionAPI {
	static p = _permissions;
	static get(params) {
		const { id } = params;
		for (let i = 0; i < _permissions.length; i++) {
			const permission = _permissions[i];
			if (permission.id === id) {
				return permission;
			}
		}
		return null;
	}

	static add(permissions) {
		permissions = makeArray(permissions);
		Array.prototype.push.apply(_permissions, permissions);
	}

	static remove(permissions) {
		permissions = makeArray(permissions);
		for (let i = 0; i < permissions.length; i++) {
			const permission = permissions[i];
			const idx = _permissions.indexOf(permission);
			if (idx < 0) continue;
			_permissions.remove(permission);
		}
	}

	static removeAll() {
		_permissions.removeAll();
	}

	static canAccessRoute(params) {
		const { plugin, method, path } = params;
		for (let i = 0; i < _permissions.length; i++) {
			const permission = _permissions[i];
			if (!permission.isGranted(plugin)) return false;
			const { routes } = permission;
			for (let j = 0; j < routes.length; j++) {
				const route = permission.routes[j];
				const canAccess = route.check(method, path);
				if (canAccess) return true;
			}
		}
		return false;
	}
}
export default PermissionAPI;

function makeArray(val) {
	if (!(val instanceof Array)) {
		val = [ val ];
	}
	return val;
}
