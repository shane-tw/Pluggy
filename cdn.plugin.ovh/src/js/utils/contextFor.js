import Dialog from '../operator/dialog';
import getSelector from './getSelector';
import Section from '../operator/section';

function contextFor(elem) {
	if (!elem || !elem.dataset) return;
	const { dataset } = elem;
	const { psPluginId, psDialogId, psComponentId } = dataset;
	if (psDialogId) {
		return Dialog.get({
			id: psDialogId, pluginId: psPluginId
		});
	}
	if (psComponentId) {
		const sectionElem = elem.closest(getSelector('section'));
		if (!sectionElem) return;
		const sectionId = sectionElem.dataset.psSectionId;
		return Section.get({ id: sectionId }).getComponent({
			id: psComponentId, pluginId: psPluginId
		});
	}
	const component = elem.closest(getSelector('component'));
	if (component) return contextFor(component);
	const dialog = elem.closest(getSelector('dialog'));
	if (dialog) return contextFor(dialog);
}
export default contextFor;
