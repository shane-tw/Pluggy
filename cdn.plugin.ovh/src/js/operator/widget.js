import CommonWidget from '../common/widget';
import Component from './component';

class Widget extends CommonWidget(Component) {
	render(elem, params = {}) {
		const override = this.renderOverride;
		if (typeof override === 'function') {
			return override.call(this, elem);
		}
		if (!elem) {
			elem = document.createElement('iframe');
			elem.sandbox = 'allow-scripts allow-forms allow-same-origin';
		}
		const url = params.url || this.url;
		if (elem.getAttribute('src') !== url) {
			elem.src = url;
		}
		return elem;
	}
}
export default Widget;
