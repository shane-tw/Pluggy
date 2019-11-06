class Section {
	static sections = {};
	components = [];
	registered = false;

	constructor(params) {
		if (!params) return;
		this.id = params.id;
	}

	get id() {
		return this._id;
	}

	set id(id) {
		if (this.id) {
			throw new Error('Section cannot change ID once set');
		}
		this._id = id;
		if (this.id) {
			this.register();
		}
	}

	addComponent(component) {
		if (this.components.indexOf(component) === -1) {
			this.components.push(component);
			component._section = this;
		}
	}

	removeComponent(component) {
		const idx = this.components.indexOf(component);
		if (idx === -1) return;
		this.components.splice(idx, 1);
	}

	removeAllComponents() {
		for (let i = 0; i < this.components.length; i++) {
			const component = this.components[i];
			component._section = null;
		}
		this.components = [];
	}

	getComponent(params) {
		const { id } = params;
		let pluginId;
		if (params.plugin) {
			pluginId = params.pluginId || params.plugin.id;
		}
		for (let i = 0; i < this.components.length; i++) {
			const component = this.components[i];
			const sameId = (id === component.id);
			const samePluginId = (!pluginId || pluginId === component.plugin.id);
			if (sameId && samePluginId) {
				return component;
			}
		}
	}

	static get(params) {
		if (!params) return;
		return Section.sections[params.id];
	}

	register() {
		if (this.registered) return this;
		if (!this.id) {
			throw new Error("Can't register section unless ID is set");
		}
		this.registered = true;
		Section.sections[this.id] = this;
		return this;
	}

	plain() {
		const copy = {
			id: this.id,
			registered: this.registered,
			components: this.components.slice(0)
		};
		const { components } = copy;
		for (let i = 0; i < components.length; i++) {
			const component = components[i];
			components[i] = component.plain();
		}
		return copy;
	}
}
export default Section;
