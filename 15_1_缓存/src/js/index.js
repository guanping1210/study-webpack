// eslint-disable-next-line
import '../style/index.less';
import './print';

function sum(...args) {
  return Array.from(args).reduce((c, p) => c + p, 0);
}

// eslint-disable-next-line
console.log(sum(1, 2, 3, 4, 5));

if (module.hot) {
  // 一旦module.hot为true, 说明开启了HMR功能  --> 让HMR功能代码生效
  module.hot.accept('./print.js', () => {
    // 方法会监听print.js文件的变化，一旦发生变化，其他模块不会重新打包构建
    // 会执行后面的回调函数
    // print();
  });
}
