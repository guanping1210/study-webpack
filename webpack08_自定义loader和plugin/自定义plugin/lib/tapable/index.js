/**
 * tapable: 是webpack工作流的核心，compiler就继承自这个
 *          webpack中负责编译的Compiler和负责创建bundles的Compilation都是tapable构造函数的实例
 * tapable提供不同的事件流执行机制，也就是所谓的钩子： 钩子分同步和异步，异步又分并行和串行，同步的钩子都是串行的
 *    SyncHook: 串行同步执行，按照顺序依次执行，不关心返回值
 *    SyncBailHook: 串行同步执行，处理函数有一个返回值不为空，则跳过剩下未执行的函数
 *    SyncWaterfallHook: 串行同步执行，上一个函数的结果作为下一个函数的参数传递进去
 *    SyncLoopHook: 串行同步执行，如果返回true,那么循环执行当前处理函数,只有返回undefined,发汇中止循环,执行下一个函数
 *    AsynvParallelHook: 异步并行执行, tapAsync + callAsync | tapPromise + promise, 所有实例并行执行,谁等待时间短就先执行
 *    AsynvParallelBailHook:
 *    AsyncSeriesHook: 异步串行执行, 按照注册顺序异步, 等待相应时长,再执行.
 *    AsyncSeriesBailHook:
 *    AsynvSeriesWaterfallHook:
 * 
 * 注意: Sync类型的钩子都是顺序执行的,只能使用tab注册
 *       Async类型的钩子,可以使用tap\tapSync\tapPromise注册不同类型的钩子,分别通过call\callAsync\promise方法调用
 * 
 * 资料：https://www.jianshu.com/p/273e1c9904d2
 * 
 */
