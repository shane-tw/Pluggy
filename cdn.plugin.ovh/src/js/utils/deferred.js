import * as errors from '../constants/errors';

// This is essentially a promise, except it times out after specified time.
// It also exposes reject and resolve so external code can trigger promises.
// Each Deferred instance has its own unique ID so it can be easily identified.
// It is used by fetchInternal when handling requests/resopnses.

class Deferred {
	static counter = 1;
	static deferreds = {};

	constructor(timeout) {
		this._id = (this.constructor.counter++).toString();
		let promise = new Promise((resolve, reject) => {
			this.reject = reject;
			this.resolve = resolve;
		});

		if (timeout > 0) {
			promise = Promise.race([
				promise, timeoutPromise(timeout)
			]);
		}

		this.promise = promise;
		addPromiseFuncs(this);

		this.promise.finally(() => {
			this.unregister();
		});
	}

	static getById(id) {
		return Deferred.deferreds[id];
	}

	get id() {
		return this._id;
	}

	register() {
		Deferred.deferreds[this.id] = this;
		return this;
	}

	unregister() {
		delete Deferred.deferreds[this.id];
		return this;
	}
}
export default Deferred;

function addPromiseFuncs(deferred) {
	const { promise } = deferred;
	deferred.then = promise.then.bind(promise);
	deferred.catch = promise.catch.bind(promise);
	deferred.finally = promise.finally.bind(promise);
}

function timeoutPromise(timeout) {
	return new Promise((_resolve, reject) => {
		setTimeout(() => reject(new Error(errors.PROMISE_TIMEOUT), timeout));
	});
}
