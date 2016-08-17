'use strict';

const timers = require('timers');

function counterClosure(count, func, data) {
    let i = 0;
    return (dataPart) => {
        if (dataPart !== undefined && dataPart !== data) Object.assign(data, dataPart);
        if (++i >= count) func(data);
    }
}

function zip(...arrays) {
    return arrays[0].map((_,i) => {
        return arrays.map(array => array[i]);
    });
}

function parallelClosure(funcs, args, data, callback) {
    return () => {
        const counterCallback = counterClosure(funcs.length, callback, data);
        for (const [f, a] of zip(funcs, args)) {
            if (typeof f === 'function') {
                Object.assign(data, a);
                // process.nextTick(() => f(data, counterCallback));
                timers.setTimeout(() => f(data, counterCallback), 0);
            } else {
                runAsync(f, a, data, counterCallback);
            }
        }
    }
}

function sequenceClosure(funcs, args, data) {
    let funcIter = funcs[Symbol.iterator]();
    let argsIter = args[Symbol.iterator]();
    let seqFunc = function (retData) {
        if (retData !== undefined && retData !== data) Object.assign(data, retData);
        let [f, a] = [funcIter.next(), argsIter.next()];
        if (f.done) return {value: data, done: true};
        if (typeof f.value === 'function') {
            Object.assign(data, a.value);
            // process.nextTick(() => f.value(data, seqFunc));
            timers.setTimeout(() => f.value(data, seqFunc), 0);
        } else {
            runAsync(f.value, a.value, data, seqFunc);
        }
    };
    return seqFunc;
}

// each func takes (data, callback)
// each callback accepts (data)
function runAsync(funcs, args, data, callback) {
    if (data === undefined) data = {};
    if (callback === undefined) callback = () => {};

    if (Array.isArray(funcs)) {
        if (funcs.length === 1 && Array.isArray(funcs[0])) {
            parallelClosure(funcs[0], args[0], data, callback)();
        } else {
            funcs.push((retData) => {
                Object.assign(data, retData);
                callback()
            });
            sequenceClosure(funcs, args, data)();
        }
    }
}

exports.runAsync = runAsync;
