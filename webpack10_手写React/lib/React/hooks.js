// 定义一个全局state来模拟，但是实际上react内部的state是挂载到fiber上的
// hooks模拟保存状态的数组
const hooksState = []
let hooksIndex = 0


// 能够触发更新
export const useState = (initState) => {
    hooksState[hooksIndex] = initState

    let index = hooksIndex
    const dispatch = (newState) => {
        hooksState[index] = newState

        // 触发更新
        // scheduleWork()
    }

    hooksIndex ++
    return [hooksState[index], dispatch]
}

export const useEffect = (callback, deps) => {

}
