import Plugin from './plugin';
import getSelector from '../utils/getSelector';
import Dialog from '../common/dialog';
import Section from './section';

class PluginAPI {
	static enable(params, holder) {
		let plugin = Plugin.get(params);
		if (!plugin) {
			plugin = new Plugin(params).register();
		}
		if (plugin.enabled) return;
		plugin.render(holder);
		plugin.enabled = true;
	}

	static disable(params) {
		const plugin = Plugin.get(params);
		if (!plugin) return;
		delete Dialog.dialogs[plugin.id];
		for (const sectionId in Section.sections) {
			const section = Section.sections[sectionId];
			for (let c = section.components.length - 1; c >= 0; c--) {
				const component = section.components[c];
				if (component.plugin && component.plugin.id == plugin.id) {
					section.removeComponent(component);
				}
			}
		}
		const toRemove = document.querySelectorAll(getSelector('plugin', plugin.id));
		for (let i = 0; i < toRemove.length; i++) {
			const tor = toRemove[i];
			tor.parentNode.removeChild(tor);
		}
		plugin.enabled = false;
	}

	static disableAll(params = {}) {
		let { exclude } = params;
		if (!(exclude instanceof Array)) {
			exclude = [];
		}
		for (const id in Plugin.plugins) {
			const plugin = Plugin.plugins[id];
			if (exclude.indexOf(plugin.id) > -1) continue;
			this.disable(plugin);
		}
	}
}
export default PluginAPI;
