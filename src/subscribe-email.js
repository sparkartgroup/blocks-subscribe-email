// This JavaScript module is exported as UMD following the pattern which can be
// found here: https://github.com/umdjs/umd/blob/master/returnExports.js

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['b'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('b'));
    } else {
        root.returnExports = factory(root.b);
    }
}(this, function (b) {

    // Module code here
    
    return {};
}));