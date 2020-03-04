import CommonSection from '../common/section';
import { getComponentElem } from '../operator/elems';
import getSelector from '../utils/getSelector';
import * as actions from '../constants/actions';

function isPrimitive(val) {
	const primitives = ['string', 'boolean', 'number'];
	return (primitives.indexOf(typeof val) > -1);
}

function getContextKO(elem) {
	const ko = window.ko;
	if (!ko) return;
	let seen = [];
	return JSON.parse(JSON.stringify(ko.dataFor(elem), (_key, val) => {
		val = ko.unwrap(val);
		if (val != null && typeof val === 'object') {
			if (seen.indexOf(val) > -1) return;
			seen.push(val);
		} else if (!isPrimitive(val)) return;
		return val;
	}));
}

function getContext(sectionElem) {
	const tmp = sectionElem.dataset.psContext;
	if (!tmp) return;
	try {
		return JSON.parse(tmp);
	} catch {} //eslint-disable-line no-empty
}

let inProgress = {};

class Section extends CommonSection {
	constructor(params) {
		super(params);
		this._renderOverride = {};
	}

	setRenderOverride(component, html) {
		if (!component || !component.tag) return;
		this._renderOverride[component.tag] = html;
	}

	getRenderOverride(component) {
		if (!component || !component.tag) return;
		return this._renderOverride[component.tag];
	}

	render(sectionElem, component) {
		let sections = [sectionElem];
		if (!sectionElem) {
			const sectionSelect = getSelector('section', this.id);
			sections = document.querySelectorAll(sectionSelect);
		}
		let promises = [];
		for (let i = 0; i < sections.length; i++) {
			const section = sections[i];
			const holder = document.createDocumentFragment();
			let components = (component ? [component] : this.components);
			for (let j = 0; j < components.length; j++) {
				const component = components[j];
				if (getComponentElem(component, section)) continue;
				inProgress[component.plugin.id] = inProgress[component.plugin.id] || {};
				if (inProgress[component.plugin.id][component.id]) continue;
				inProgress[component.plugin.id][component.id] = true;
				const pluginFrame = component.plugin._elem;
				if (!pluginFrame) continue;
				const promise = new Promise((resolve, reject) => {
					const channel = new MessageChannel();
					channel.port1.onmessage = (e) => resolve(e.data);
					channel.port1.onmessageerror = (e) => reject(e.data);
					pluginFrame.contentWindow.postMessage({
						action: actions.GET_RENDER_PARAMS,
						params: {
							component: component.plain(),
							context: getContextKO(section) || getContext(section)
						}
					}, '*', [channel.port2]);
				});
				promise.then((params) => {
					const child = component.render(null, params);
					const dataset = child.dataset;
					dataset.psComponentId = component.id;
					dataset.psComponentTag = component.tag;
					dataset.psPluginId = component.plugin.id;
					holder.appendChild(child);
					delete inProgress[component.plugin.id][component.id];
				});
				promises.push(promise);
			}

			Promise.all(promises).then(() => {
				section.appendChild(holder);
			});
		}
	}
}
export default Section;
