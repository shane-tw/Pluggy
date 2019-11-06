import init from './init';
import './listeners';

// IE11's sandbox, unlike other browsers, doesn't prevent plugins using alert().
// This attempts to prevent using alert() on IE11, but it's not perfect.
// One could still obtain an alert() instance before importing this plugin.
window.alert = () => {
	throw new Error('Plugins are not permitted to use alert().');
};

export default { init };
