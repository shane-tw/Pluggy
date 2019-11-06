import { getComponentElems } from './elems';
import * as errors from '../constants/errors';
import CommonComponent from '../common/component';

class Component extends CommonComponent {
	init(params) {
		this.id = params.id;
		this.plugin = params.plugin;
	}

	update(params, opts) {
		const updated = super.update(params, opts);
		if (!updated) return;
		const components = getComponentElems(this);
		for (let i = 0; i < components.length; i++) {
			this.render(components[i]);
		}
	}

	set plugin(plugin) {
		if (this.plugin && this.plugin !== plugin) {
			throw new Error(errors.CANT_CHANGE_ID);
		}
		this._plugin = plugin;
	}

	get plugin() {
		return this._plugin;
	}

	static setRenderOverride(section, html) {
		if (!section) return;
		section.setRenderOverride(this, html);
	}

	static getRenderOverride(section) {
		if (!section) return;
		return section.getRenderOverride(this);
	}

	set renderOverride(html) {
		this._renderOverride = html;
	}

	get renderOverride() {
		const override = this._renderOverride;
		const sectionOverride = this.constructor.getRenderOverride(this.section);
		return override || sectionOverride;
	}

	// Handles creating/updating the component's DOM element
	render(_elem) {
		throw new Error('Component with tag ' + this.tag + ' lacks render().');
	}
}
export default Component;
