import CommonSection from '../common/section';
import { getComponentElem } from '../operator/elems';
import getSelector from '../utils/getSelector';
import * as actions from '../constants/actions';
import Deferred from '../utils/deferred';

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

function handleDeferred(deferred, component, holder) {
	if (!deferred) return;
	deferred.then((params) => {
		const child = component.render(null, params);
		const dataset = child.dataset;
		dataset.psComponentId = component.id;
		dataset.psComponentTag = component.tag;
		dataset.psPluginId = component.plugin.id;
		holder.appendChild(child);
		delete inProgress[component.plugin.id][component.id];
	});
}

function handleAll(promises, section, holder) {
	Promise.all(promises).then(() => {
		section.appendChild(holder);
	});
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
				const deferred = new Deferred().register();
				handleDeferred(deferred, component, holder);
				pluginFrame.contentWindow.postMessage({
					action: actions.GET_RENDER_PARAMS,
					deferredId: deferred.id,
					params: {
						component: component.plain(),
						context: getContextKO(section) || getContext(section)
					}
				}, '*');
				promises.push(deferred);
			}
			handleAll(promises, section, holder);
		}
	}
}
export default Section;
