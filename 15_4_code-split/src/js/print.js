// import _ from 'lodash'

console.log('我要变身啦');

// print方法虽然定义了，但是没有被调用，也就是tree上黄色的叶子，需要被清除掉
export const print = (x, y) => x % y;

// add方法被调用了，说明是tree上绿色的叶子
export const add = (x, y) => x + y;
