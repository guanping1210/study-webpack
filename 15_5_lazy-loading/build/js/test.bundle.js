(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["test"],{

/***/ "./src/js/print.js":
/*!*************************!*\
  !*** ./src/js/print.js ***!
  \*************************/
/*! exports provided: print, add */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "print", function() { return print; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "add", function() { return add; });

console.log('print.js加载了');

// print方法虽然定义了，但是没有被调用，也就是tree上黄色的叶子，需要被清除掉
const print = (x, y) => x % y;

// add方法被调用了，说明是tree上绿色的叶子
const add = (x, y) => x + y;


/***/ })

}]);
//# sourceMappingURL=test.bundle.js.map