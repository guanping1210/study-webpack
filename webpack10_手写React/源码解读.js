    /**
    * React理念：CUP + IO -->  同步递归更新 变为 异步循环可中断更新
    * React15：Reconciler协调器(递归处理虚拟DOM ) + Renderer渲染器(将变化的组件渲染到页面上)，交替更新执行（同步递归更新无法中断）
    *              x2
    *          1  --> reconciler发现1需要变为2，通知renderer,renderer把1变为2，渲染到页面上 --> 2
    *          2  --> reconciler发现2需要变为4，通知renderer,renderer把2变为4，渲染到页面上 --> 4
    *          3  --> 如果此时被中断，那么3不会被更新，最后得到的就是错误的渲染结果           -- > 3 (本来应该渲染6的)
    *
    * React16：Scheduler调度器(内存中执行) + Reconciler协调器(内存中执行) + Renderer渲染器（异步可中断执行）
    *    Scheduler: 调度任务的优先级，高优先级任务先进入Reconciler
    *              1、以浏览器是否有剩余时间作为任务中断的标准，也就是一帧的时间16ms, 当浏览器有剩余时间就通知我们
    *              2、requestIdleCallback(callback, options), 这个函数可以拿到浏览器一帧的空闲时间，当浏览器一帧内的工作，包括处理用户交互、
    *                  JS解析执行、帧变化、rAF、布局和绘制所完成的时间没有超过16ms，说明时间有富余，就会执行requestIdleCallback的注册的callback任务。
    *                  如果有options设置，则表示超过这个时间后，如果任务还没执行，那么强制执行，不必等待空闲时间
    *              3、react实现了一套全新的requestIdleCallback polyfill，也就是所谓的Scheduler，原理和requestIdleCallback是一致的
    *
    *    Reconciler:负责找出变化的组件, 更新从递归变成了可中断的循环过程，每次循环都会调用shouldYield判断当前是否有空余时间。
    *               当Scheduler将任务交给Reconciler后，Reconciler会为变化的VDOM打上代表增/删/更新的标记，而不再是直接与Renderer交替工作了。
    *               当所有的组件都完成Reconciler的工作，才会统一交给Renderer
    *
    *    Renderer: 负责将变化的组件渲染到页面上
    *              根据Reconciler为VDOM打的标记，同步执行对应的DOM操作
    *
    * Fiber含义：1、架构方面，Reconciler基于Fiber实现，所以被称为Fiber Reconciler。
    *              每个fiber依靠return\child\sibling属性连接成为一棵fiber树
    *                  return：父节点（因为这个表示执行完completeWork后返回的下一个节点，子fiber和兄弟fiber完成工作后都会返回其父节点，所以用return指代父节点）
    *                  child: 子节点
    *                  sibling: 兄弟节点
    *
    *        2、静态的数据结果方面，每个fiber节点是对应一个React element的，保存了该组件的很多信息。
    *              tag: fiber对应组件的类型 Function/Class/HostComponent...
    *              key: 就是我们常用的那个key属性
    *              elementType: 基本上与type的值相同
    *              type: 组件类型（函数本身、Class、DOM节点的tagName）
    *              stateNode: fiber对应的真实DOM节点
    *
    *        3、动态的工作单元方面，每个fiber节点保存了本次更新中该组件的状态、要执行的工作（删除、新增、更新）。
    *              xxxProps: 表示props相关的更新
    *              xxxState：表示state相关的更新
    *              xxxEffect: 表示本次更新会造成的DOM操作相关的副作用
    *              lanes: 表示调度优先级
    *              childLanes：表示调度优先级
    *
    * Fiber工作原理：Reconciler工作的阶段叫render阶段，Renderer工作的阶段叫commit阶段，render与commit阶段统称为work,即react在工作
    *       1、双缓存Fiber树：借鉴于canvas的双缓存概念，也就是在内存中绘制新的图(不可见)，直接用内存中新的图代替上一帧的画面。
    *            在React中最多会同时出现两棵Fiber树，当前屏幕上的叫current Fiber树，在内存中构建的叫worlInProgress Fiber树，
    *            current的fiber节点叫currentFiber，workInProgress中的fiber节点叫workInProgressFiber, 通过alternate属性链接。
    *              currentFiber.alternate = worInProgressFiber   workInProgressFiber.alternate = currentFiber
    *
    *            其实就是应用根节点的current指针，在不同的Fiber树的rootFiber间切换来实现Fiber树的切换。
    *            当workInProgressFiber树构建完成后交给Renderer渲染到页面上，应用根节点的current指针指向workInProgressFiber树，
    *            此时的workInProgressFiber树就变成了currentFiber树。
    *
    *            fiberRootNode: 整个应用的根节点
    *            rootFiber：当前组件的根节点
    *
    *      2、mount时：此时current = null
    *            (1)、首次执行ReactDOM.render会创建fiberRootNode,和rootFiber
    *                  fiberRootNode.current = rootFiber，首屏渲染，此时的rootfiber没有任何fiber子节点(也就是currentFiber树是空的，但是内部的属性那些还是在的)
    *            (2)、进入render阶段，根据组件的JSX在内存中构建workInProgressFiber树，复用currentFiber树已有的属性
    *                  currentFiber.alternate = workInProgressFiber树
    *            (3)、将workInProgressFiber树，渲染到页面，也就是fiberRootNode.current指向WorkInProgress Fiber树，使其变为current fiber树
    *
    *      3、update时：此时current != null
    *            (1)、开启一次新的render过程，创建一个新的workInProgress Fiber树，这个树能复用current Fiber树的一些节点属性
    *                 (current fiber树对应的节点属性能否复用的决定过程，就是diff算法)
    *            (2)、workInProgress Fiber树在render阶段完成构建后，进入commit阶段渲染到页面上，渲染完毕后，变为current fiber树
    *
    *
    * Reconciler阶段(render): 可以通过current === null, 来区分是mount时期还是update时期
    *       1、从rootFiber向下深度优先遍历，为遍历的每个fiber节点调用beginWork方法
    *              beginWork: 根据传入的fiber节点创建子fiber节点，并将两个fiber节点连接起来
    *                参数：current：上一次更新的fiber节点，也就是workInProgress.alternate
    *                      workInProgress: 当前组件对应的fiber节点
    *                      renderLanes：优先级
    *
    *              beginWork工作分两部分：节点能复用的情况，判定的过程就是diff算法
    *                      update: 一定条件下复用current节点，克隆current.child作为workInProgress.child, 不需要新建workInProgrss.child
    *                      mount: 除fiberRootNode以外，current = null时，会根据fiber.tag的不同，创建不同类型的子fiber节点
    *
    *              节点可复用的情况：
    *                      (1)、oldProps === newProps && workInProgress.type === current.type, 也就是组件的属性和类型不变，可直接复用
    *
    *              reconcileChildren：内部的实现就是diff算法，也是Reconciler模块的核心
    *                      (1)、对于mount组件，创建新的子fiber节点
    *                      (2)、对于update组件，将当前组件与上次生成的current fiber节点比较(diff算法)，将比较的结果生成新的fiber节点，带上effectTag
    *
    *              effectTag: 就是记录的要执行的DOM操作的具体类型(增加/删除/更新)  --> 为什么操作类型用二进制表示呢？ --> 能够方便的使用位操作赋值多个effect
    *                          (mount时只有rootfiber会赋值Placement effectTag, 在commit阶段只会执行一次插入操作)
    *                  Placement = 0b00000000000010
    *                  Update = 0b00000000000100
    *                  PlacementAndUpdate = 0b00000000000110
    *                  Deletion = 0b00000000001000
    *
    *       2、当遍历到叶子节点时，进入归阶段，调用completeWork处理fiber节点
    *              completeWork: 执行完当前fiber节点，继续执行其兄弟节点或者其父节点，也就是所谓的归阶段。针对不同的fiber.tag，执行不同的逻辑
    *                  参数：current workInProgress renderLanes
    *          
    *              completeWork工作情况：根据current === null ? mount : update
    *                  update: 此时fiber节点已经有对应的DOM节点，主要是处理相关的props的变化
    *                  mount: 为fiber节点生成对应的DOM节点，将子孙DOM插入到刚生成的DOM中，处理props
    *              
    *              HostComponent: 原生DOM组件对应的fiber节点，主要关注这个
    *                  updateHostComponent: 主要在update阶段处理fiber相关的props
    *
    *              effectList: 记录所有fiber的effect变化，形成一个单向链表，后续只需要遍历effectList就能执行所有的effect了
    *                                        nextEffect         nextEffect
    *                  rootFiber.firstEffect -----------> fiber ------------> fiber
    *
    *       3、递和归阶段交替执行直到回归到rootFiber，render阶段的工作就结束了
    *
    * Renderer阶段(commit)：commonRoot方法时commit阶段工作的起点，fiberRootNode会作为传参
    *       1、rootFiber.firstEffect保存了一条fiber effect的单向链表effectList, 这个fiber节点的updateQueue保存了变化的props。
    *          这些副作用对应的DOM操作在commit阶段执行，以及一些生命周期钩子，hooks等
    *
    *      2、commit的工作流程：分为三个阶段
    *          (1)、执行DOM操作前：主要是做一些变量赋值、状态重置的工作，遍历effectList并调用commitBeforeMutationEffects函数处理
    *                  处理DOM节点渲染/删除后的autoFocus\blur逻辑；
    *                  调用getSnapshotBeforeUpdate生命周期钩子；
    *                  调度useEffect(调用scheduler模块提供的scheduleCallback方法，用于以某个优先级异步调度一个回调函数)
    *
    *          (2)、执行DOM操作：遍历effectList, 执行commitMutationEffects函数
    *                  根据ContentRest effectTag重置文字节点；
    *                  更新ref;
    *                  根据effectTag分别处理(Placement, Update, Deleteion, Hydrating);
    *
    *
    *          (3)、执行DOM操作后：遍历effectList，执行commitLayoutEffects函数
    *        
    * diff算法：复杂程度最大能够达到O(n^3), n表示树中元素的数量
    *      限制：为了降低算法复杂度，有做三个限制
    *          (1)、只对同级元素进行diff，如果一个节点跨层级了，不会被复用
    *          (2)、如果节点类型变化了，例如div变为p, 那么会直接销毁div及其子孙节点，并创建p及其子孙节点
    *          (3)、通过key props来暗示哪些子元素在不同的渲染下保存稳定
    *
    *      diff分类：入口是reconcilChildFibers(returnFiber, currentFirstChild, newChild)函数
    *          总体其实就是：比较key  -->  type ，当key+type都相同时，该DOM节点可以复用
    *          (1)、newChild类型是Object、Number、string，表示同级只有一个节点
    *          (2)、newChild类型是array时，表示同级有多个节点(其实变化的情况只有三种：节点更新|节点减少或新增|节点位置变化)
    *
    * diff算法的整体逻辑：
    *          第一轮遍历：处理更新的节点
    *          第二轮遍历：处理剩下的不属于更新的节点
    *
    * update分类：
    *      HostRoot --> 原生DOM --> 触发方式：render
    *      ClassComponent --> class组件 --> 触发方式：this.state, this.forceUpdate
    *      FunctionComponent --> function组件 --> 触发方式：useState, useReducer
    *
    * 
    * 
    * 继续源码阅读：https://react.iamkasong.com/state/update.html#update%E7%9A%84%E7%BB%93%E6%9E%84
    * 
    * 
    * 
    */