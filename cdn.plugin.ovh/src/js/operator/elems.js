import getSelector from '../utils/getSelector';
import * as misc from '../constants/misc';
import * as tags from '../constants/tags';
import * as validate from '../utils/validate';

export const getPluginFrame = plugin => {
	validate.ensureObject(plugin);
	const holder = document.getElementById(misc.PLUGIN_HOLDER_ID);
	if (!holder) return;
	const pluginSelect = getSelector('plugin', plugin.id);
	return holder.querySelector('iframe' + pluginSelect);
};

export const getDialogElem = dialog => {
	validate.ensureObject(dialog);
	const holder = document.getElementById(misc.DIALOG_HOLDER_ID);
	if (!holder) return;
	const dialogSelect = getSelector('dialog', dialog.id);
	return holder.querySelector('.dialog' + dialogSelect);
};

export const getComponentElems = (component, root = document, single) => {
	if (!component) return;
	let { tag, id } = component;
	const pluginId = component.pluginId || component.plugin.id;
	if (tag !== tags.DIALOG) {
		tag = tags.COMPONENT;
	}
	const componentSelect = getSelector(tag, id);
	const pluginSelect = getSelector('plugin', pluginId);
	let op = (single ? 'querySelector' : 'querySelectorAll');
	return root[op](componentSelect + pluginSelect);
};

export const getComponentElem = (component, root) => {
	return getComponentElems(component, root, true);
};
