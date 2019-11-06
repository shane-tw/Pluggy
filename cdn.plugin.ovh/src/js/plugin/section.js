import CommonSection from '../common/section';
import * as actions from '../constants/actions';

class Section extends CommonSection {
	register() {
		if (this.registerTimer) return this;
		this.registerTimer = new Promise((resolve, _reject) => {
			setTimeout(() => {
				super.register();
				delete this.registerTimer;
				window.parent.postMessage({
					action: actions.SECTION_REGISTER,
					params: this.plain()
				}, '*');
				resolve();
			}, 50);
		});
		return this;
	}
}
export default Section;
