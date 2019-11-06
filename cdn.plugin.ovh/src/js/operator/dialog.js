import * as actions from '../constants/actions';
import CommonDialog from '../common/dialog';
import * as misc from '../constants/misc';

class Dialog extends CommonDialog {
	_rendered = false;
	static zIndex = 1000001;

	init(params) {
		this.id = params.id;
		this.plugin = params.plugin;
	}

	static get(params) {
		if (!params) return;
		const pluginId = params.pluginId || params.plugin.id;
		const pluginDialogs = Dialog.dialogs[pluginId] || {};
		const dialog = pluginDialogs[params.id];
		return dialog;
	}

	update(params, opts = {}) {
		const { visible : wasVisible } = this;
		const updated = super.update(params, opts);
		if (!updated) return;
		if (!this.visible && !wasVisible) return;
		const holder = document.getElementById(misc.DIALOG_HOLDER_ID);
		const render = this.render(this._rendered);
		if (!wasVisible && this.visible) {
			if (!this._rendered) {
				holder.appendChild(render);
			}
			render.style.zIndex = this.constructor.zIndex++;
		}
		this._rendered = render;
	}

	set visible(visible) {
		this._visible = visible;
	}

	get visible() {
		return this._visible;
	}

	runCallback(elem, type) {
		if (['onShow', 'onHide'].indexOf(type) > -1) {
			const visible = (type === 'onShow');
			this.update({ visible }, { validate: false });
		}
		const pluginFrame = this.plugin._elem;
		if (!pluginFrame) return;
		pluginFrame.contentWindow.postMessage({
			action: actions.DIALOG_CALLBACK,
			subAction: type,
			params: this.plain()
		}, '*');
	}

	onClickOutside(evt) {
		const elem = evt.target;
		// If the overlay was clicked, not the dialog's contents
		if (elem.classList.contains('dialog')) {
			this.hide(elem);
		}
	}

	render(overlay) {
		let content, header, headerIcons, headerTitle,
			headerClose, body, bodyIframe;
		if (overlay) {
			content = overlay.querySelector('.dialog-content');
			header = content.querySelector('.dialog-header');
			headerIcons = header.querySelector('.dialog-header__icons');
			headerTitle = header.querySelector('.dialog-header__title');
			headerClose = header.querySelector('.dialog-header__close');
			body = content.querySelector('.dialog-body');
			bodyIframe = body.querySelector('.dialog-body__frame');
		} else {
			overlay = document.createElement('div');
			content = document.createElement('div');
			header = document.createElement('div');
			headerIcons = document.createElement('div');
			headerTitle = document.createElement('div');
			headerClose = document.createElement('span');
			body = document.createElement('div');
			bodyIframe = document.createElement('iframe');

			overlay.appendChild(content);
			content.appendChild(header);
			header.appendChild(headerIcons);
			header.appendChild(headerTitle);
			header.appendChild(headerClose);
			content.appendChild(body);
			body.appendChild(bodyIframe);

			overlay.dataset.psPluginId = this.plugin.id;
			overlay.dataset.psDialogId = this.id;

			overlay.classList.add('dialog', 'dialog--hidden');
			content.classList.add('dialog-content');
			header.classList.add('dialog-header');
			headerIcons.classList.add('dialog-header__icons');
			headerTitle.classList.add('dialog-header__title');
			headerClose.classList.add('dialog-header__close');
			body.classList.add('dialog-body');
			bodyIframe.classList.add('dialog-body__frame');
			bodyIframe.sandbox = 'allow-scripts allow-forms allow-same-origin';

			bodyIframe.dataset.psPluginId = this.plugin.id;
			bodyIframe.dataset.psDialogId = this.id;

			headerClose.innerHTML = '&times;';
			headerClose.addEventListener('click', () =>
				this.runCallback(overlay, 'onHide')
			);
			bodyIframe.addEventListener('load', () =>
				this.runCallback(overlay, 'onLoad')
			);
			overlay.addEventListener('click', evt =>
				this.onClickOutside(evt)
			);
		}

		headerTitle.innerText = this.title;
		if (this.visible && bodyIframe.getAttribute('src') !== this.url) {
			bodyIframe.src = this.url;
		}

		let op = (this.modal ? 'add' : 'remove');
		overlay.classList[op]('dialog--modal');

		op = (!this.visible ? 'add' : 'remove');
		overlay.classList[op]('dialog--hidden');

		header.style.color = this.textColor;
		header.style.backgroundColor = this.backgroundColor;

		let hPos = this.horizontalPos;
		if (hPos === 'left') {
			hPos = 'flex-start';
		} else if (hPos === 'right') {
			hPos = 'flex-end';
		}
		overlay.style.justifyContent = hPos;

		let vPos = this.verticalPos;
		if (vPos === 'top') {
			vPos = 'flex-start';
		} else if (vPos === 'bottom') {
			vPos = 'flex-end';
		}
		overlay.style.alignItems = vPos;

		content.style.height = this.height;
		content.style.width = this.width;

		return overlay;
	}

	show(elem) {
		this.runCallback(elem, 'onShow');
	}

	hide(elem) {
		this.runCallback(elem, 'onHide');
	}

	register() {
		Dialog.dialogs[this.plugin.id] = Dialog.dialogs[this.plugin.id] || {};
		Dialog.dialogs[this.plugin.id][this.id] = this;
	}

	editableFields() {
		return Object.assign({}, super.editableFields(), {
			visible: 1
		});
	}

	plain() {
		return Object.assign({}, super.plain(), {
			pluginId: this.plugin.id
		});
	}
}
export default Dialog;
