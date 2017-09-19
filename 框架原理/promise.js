// 参考链接: https://zhuanlan.zhihu.com/p/25178630
// promise实现基本原理
// then方法可以被同一个promise调用
// 如果调用then/catch的时候promise的状态还不是resolve/reject,调用then/catch会返回新的promise,并把onSuccess和onFail方法生成QueenItem实例push到promise的queen队列
// 当promise状态改变的时候,遍历内部queen数组,执行回调(onSuccess/onFail),生成的结果设置为新的promise的state和value
function INTERNAL() {
    
}
function isFunction(func) {
    return typeof func === 'function';
}
function isObject(obj) {
    return typeof obj === 'object';
}
function isArray(arr) {
    return [].prototype.toString.call(arr) === '[object Array]';
}
var PENDING = 0;
var FULFILLED = 1;
var REJECTED = 2;
// 调用new Promise(resolver),实际就是调用safelyResolver
function Promise(resolver) {
    if (!isFunction(resolver)) {
        throw new TypeError('resolver must be a function');
    }
    // 初始化状态就是pending
    this.state = PENDING;
    // 初始化value是undefined
    this.value = void 0;//void 0 == undefined
    // 初始化回调队列是[]
    this.queue = [];
    if (resolver !== INTERNAL) {
        safelyResolveThen(this, resolver);
    }
}
// 安全地执行then函数
// new Promise((resolve, reject) => {});
function safelyResolveThen(self, then) {
    // 只允许调用一次的标志,闭包变量
    var called = false;
    try {
        // then第一个参数是resolve,后面resolve(value)
        // 第二个参数是reject,后面reject(error)
        then(function(value) {
            // 如果已经调用过了,直接返回
            if (called) {
                return;
            }
            called = true;
            doResolve(self, value);
        }, function (error) {
            if (called) {
                return;
            }
            called = true;
            doReject(self, error);
        });
    } catch(error) {
        if (called) {
            return;
        }
        called = true;
        doReject(self, error)
    }
}
function doResolve(self, value) {
    try {
        // promise.then(value)接受到的值是以resolve(value)为基础判断的
        // 若value不是promise,value传到then中
        // 若value是promise,则里面的promise再次执行resolve后的值重新经过2判断,如果最后是value,传到then中
        var then = getThen(value);
        if (then) {
            safelyResolveThen(self, then);
        } else {
            self.state = FULFILLED;
            self.value = value;
            // 遍历原来promise的queue的item的fufilled方法,并把值传进去
            self.queue.forEach(function(queueItem) {
                queueItem.callFulfilled(value);
            })
        }
        return self;
    } catch (error) {
        return doReject(self, error);
    }
}
function doReject(self, error) {
    self.state = REJECTED;
    self.value = error;
    self.queue.forEach(function (queueItem) {
        queueItem.callRejected(error);
    });
    return self;
}
function getThen(obj) {
    // resolve(new Promise())
    // &&判断两边
    // undefined or ...
    var then = obj && obj.then;
    if (obj && (isObject(obj)) || isFunction(obj) || isFunction(then)) {
        return function appThen() {
            then.apply(obj, arguments);
        }
    }
}
// var a =  (new promise()).then;
// a.then(doSth());
// 处理这种情况只要检测是否
Promise.prototype.then = function(onFulfilled, onRejected) {
    // 如果不是function,直接返回之前的this
    if (!isFunction(onFulfilled) && this.state === FULFILLED || !isFunction(onRejected) && this.state === REJECTED) {
        return this;
    }
    // 返回一个新的promise,this.constructor指向构造函数
    // 新产生的promise认为是原先promise内部的promise,根据原先promise的状态和值产生自身的状态和值
    // 外部promise(刚开始的new Promise())则需要传入回调函数决定状态和值
    var promise = new this.constructor(INTERNAL);
    // 如果现在的状态不是pending,解决下面的情况,先调用的是promise的第一个then,然后加入quene
    // 当状态变为not pending,调用里面的回调,然后又触发promise.then(),此时进入下面的判断
    // promise.then(() => {
    //     promise.then(() => {})
    // })
    if (this.state !== PENDING) {
        var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
        unwrap(promise, resolver, this.value);
    } else {
        // 将Fufilled和Reject放入queue
        this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
    }
    return promise;
}
// 解包函数(执行函数)
function unwrap(promise, func, value) {
    var returnValue;
    try {
        // 里面的promise会接受到wrap的promise产生的值
        returnValue = func(value);
    } catch(error) {
        return doReject(promise, error);
    }
    if (returnValue === promise) {
        // 不允许返回自身,会造成死循环
        doReject(promise, new TypeError("Can't resolve promise with itself"));
    } else {
        doResolve(promise, returnValue);
    }
}
function QueueItem(promise, onFulfilled, onRejected) {
    this.promise = promise;
    this.callFulfilled = function(value) {
        doResolve(this.promise, value);
    }
    this.callRejected = function (error) {
        doReject(this.promise, error);
    };
    if (isFunction(onFulfilled)) {
        this.callFulfilled = function (value) {
            unwrap(this.promise, onFulfilled, value);
        };
    }
    if (isFunction(onRejected)) {
        this.callRejected = function (error) {
            unwrap(this.promise, onRejected, error);
        };
    }
}
Promise.resolve = resolve;
function resolve(value) {
    // 如果value是Promise类型,直接返回
    if (value instanceof this) {
        return value;
    }
    return doResolve(new this(INTERNAL), value);
}
Promise.reject = reject;
function reject(value) {
    if (value instanceof this) {
        return this;
    }
    return doReject(new this(INTERNAL), value);
}
Promise.all = all;
function all(iterable) {
    var self = this;
    if (!Array.isArray(iterable)) {
        return this.reject(new TypeError('must be an array'));
    }
    var len = iterable.length;
    var called = false;
    if (!len) {
        return this.resolve([]);
    }
    var values = new Array(len);
    var resolved = 0;
    var i = -1;
    var promise = new this(INTERNAL);
    while(++i < len) {
        allResolver(iterable[i], i);
    }
    return promise;
    function allResolver(value, i) {
        // 在proimse的queue中依次加入promise
        self.resolve(value).then(resolveFromAll, function(error) {
            // 当有一个promise发生错误,直接返回
            if (!called) {
                called = true;
                doReject(promise, errpr);
            }
        })
    }
    function resolveFromAll(outValue) {
        values[i] = outValue;
        if (++resolved === len && !called) {
            // 保证promise.all返回的promise只resolve一次
            // 遍历queue执行Fulfilled/Rejected
            called = true;
            doResolve(promise, values);
        }
    }
}
Promise.race = race;
function race(iterable) {
    var self = this;
    if (!Array.isArray(iterable)) {
        return this.reject(new TypeError('must be an array'));
    }
    var len = iterable.length;
    var called = false;
    if (!len) {
        return this.resolve([]);
    }
    var i = -1;
    var promise = new this(INTERNAL);
    while(++i < len) {
        resolver(iterable[i]);
    }
    return promise;
    function resolver(value) {
        self.resolve(value).then(function(response) {
            // 收集依赖
            // 只会调用一次,竞争调用
            if (!called) {
                called = true;
                doResolve(promise, response);
            }
        }, function(error) {
            if (!called) {
                called = true;
                doReject(promise, error);
            }
        })
    }
}
module.exports = Promise;

// 同一个promise可以被多次then调用
// promise.then(),promise.then(),Promise对象里面的queen分别push两个promise
// promise.then().then(),Promise对象里面的queen是嵌套的