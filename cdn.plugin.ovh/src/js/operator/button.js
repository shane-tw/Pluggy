import CommonButton from '../common/button';
import Component from './component';
import * as actions from '../constants/actions';
import closest from '../utils/closest';
import getSelector from '../utils/getSelector';

function isPrimitive(val) {
	const primitives = ['string', 'boolean', 'number'];
	return (primitives.indexOf(typeof val) > -1);
}

function getContextKO(elem) {
	const ko = window.ko;
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

function getContext(elem) {
	const sectionElem = closest(elem, getSelector('section'));
	const tmp = sectionElem.dataset.psContext;
	if (!tmp) return;
	try {
		return JSON.parse(tmp);
	} catch {} //eslint-disable-line no-empty
}

class Button extends CommonButton(Component) {
	handleClick(evt) {
		const { target : elem } = evt;
		let context;
		// This lets buttons access KnockoutJS context
		// Useful for Teamwork Projects
		if (window.ko) {
			context = getContextKO(elem);
		} else {
			context = getContext(elem);
		}
		const pluginFrame = this.plugin._elem;
		if (!pluginFrame) return;
		pluginFrame.contentWindow.postMessage({
			action: actions.BUTTON_CALLBACK,
			subAction: 'onClick',
			params: { button: this.plain(), context }
		}, '*');
	}

	render(elem, params = {}) {
		const override = this.renderOverride;
		if (typeof override === 'function') {
			return override.call(this, elem, params);
		}
		if (!elem) {
			elem = document.createElement('button');
			elem.addEventListener('click', this.handleClick.bind(this));
		}
		elem.innerText = params.label || this.label;
		return elem;
	}
}
export default Button;
