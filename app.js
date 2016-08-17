const nyaa = require('./nyaasync');
const nyaa2 = require('./nyaasync2');
const fs = require('fs');

function sleep(delay) {
    const start = new Date().getTime();
    while (new Date().getTime() - start < delay) {}
}

function f1 (data, callback) {
    console.log('f1');
    console.log('f1 data: ', JSON.stringify(data));
    sleep(1000);
    callback({f1: 'f1'});
};

function f2 (data, callback) {
    console.log('f2');
    console.log('f2 data: ', JSON.stringify(data));
    callback({f2: 'f2'});
};

function f3 (data, callback) {
    console.log('f3');
    console.log('f3 data: ', JSON.stringify(data));
    callback({f3: 'f3'});
};

function pf1 (data, callback) {
    console.log('pf1');
    console.log('pf1 data: ', JSON.stringify(data));
    fs.readFile("aaa", (err, data) => {
        console.log("pf1", data);
        console.log(data.length);
        callback({pf1: data});
    })
};

function pf2 (data, callback) {
    console.log('pf2');
    // console.log('pf2 data: ', JSON.stringify(data));
    fs.readFile("bbb", (err, data) => {
        console.log("pf2", data);
        callback({pf2: data});
    })
};

const seq = [f1, f2, [[pf1, [f1, f2, f3], pf2]], f3];
const args = [{name: 'dataf1'}, {name: 'dataf2'}, [[{name: 'datapf1'}, [{}, {}, {}], {name: 'datapf2'}]], {name: 'dataf3'}];
const args2 = {f1: {n: 'dataf1'}, f2: {n: 'dataf2'}, pf1: {n: 'datapf1'}, pf2: {n: 'datapf2'}, f3: {n: 'dataf3'}};

console.log("Starting first variant");
nyaa.runAsync(seq, args);

setTimeout(() => {
        console.log("Starting second variant");
        nyaa2.runAsync(seq, args2)
    }, 10000);
