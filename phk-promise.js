const STATUSES = {
    pending: 'PENDING',
    resolved: 'RESOLVED',
    rejected: 'REJECTED'
};
  
const sCallbacks = Symbol('callbacks');
const sCurrentCallbackIndex = Symbol('currentCallbackIndex');
const sIterate = Symbol('iterate');
const sOnComplete = Symbol('onComplete');
  
exports.phkPromise = class phkPromise {
    constructor (fn) {
        this[sCurrentCallbackIndex] = 0;
        this[sCallbacks] = [];
        
        this[sIterate] = iterate.bind(this);
        this[sOnComplete] = onComplete.bind(this);
        
        setTimeout(() => {
            this[sIterate](fn);
        });
    }

    then (onResolve, onReject) {
        if (typeof onResolve === 'function') {
            const callbackInstance = new Callback(STATUSES.pending, onResolve, function () {});

            this[sCallbacks].push(callbackInstance);
            this.catch(onReject, callbackInstance);
        }

        return this;
    }

    catch (onReject, callbackInstance) {
        if (typeof onReject === 'function' && callbackInstance instanceof Callback) {
            callbackInstance.onReject = onReject;
        }

        return this;
    }
};
  
class Callback {
    constructor (status, onResolve, onReject) {
        this.status = status;
        this.onResolve = onResolve;
        this.onReject = onReject;
    }
}

function iterate (fn, arg) {
    try {
        const currentCallback = this[sCallbacks][this[sCurrentCallbackIndex]];
      
        fn(() => {
            const result = currentCallback.onResolve(arg);

            this[sCallbacks][this[sCurrentCallbackIndex]].status = STATUSES.resolved;
        
            this[sOnComplete](result);
        }, (...args) => {
            currentCallback.onReject();
        
            this[sCallbacks][this[sCurrentCallbackIndex]].status = STATUSES.rejected;
        
            this[sOnComplete]();
        });
    } catch (err) {
        if (typeof this[sCallbacks][this[sCurrentCallbackIndex]].onReject === 'function') {
            this[sCallbacks][this[sCurrentCallbackIndex]].onReject(err);
        } else {
            throw new Error('Unhandled promise rejection');
        }
    }
}
  
function onComplete (returnValue) {
    if (this[sCallbacks][this[sCurrentCallbackIndex] + 1]) {
        this[sCurrentCallbackIndex]++;
      
        this[sIterate](resolve => {
            resolve();
        }, returnValue);
    }
}
