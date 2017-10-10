// 当某个状态被多个组件依赖或者影响的时候，要把状态提升。
// 当状态很多的时候,就需要状态管理工具把这些状态独立出来管理和共享
// redux是一种架构模式(store,dispatch,action,reducer)数据的一种共享和改变的架构,提供一种可预料的状态操作(提高修改数据的门槛)
// redux提供createStore来返回函数去获取数据和更改数据,store存在闭包,只能通过特殊的方式去改变.并且提供发布订阅的模式,可以手动将页面的渲染(修改dom)订阅到数据的变化
// 里面调用观察者模式,观察者(页面的渲染)监听被观察者(数据的变化)
// 观察者模式也叫发布订阅模式,页面的渲染订阅数据的变化(subscribe函数),调用dispatch发布(调用渲染函数)
// 对象的引用是堆中的内存地址,不是直接的引用.对象嵌套对象也是一样的道理
// 通过es6的...(是浅复制,第一层引用的内存地址是不变的,就可以实现对象的复用,减少渲染)(reducer的优化)
function createStore(reducer) {
    let state = null;
    const listeners = [];
    const subscribe = (listener) => {
        listeners.push(listener);
    }
    const getState = () => state;
    const dispatch = (action) => {
        state = reducer(action);
        listeners.forEach((listener) => {
            listener();
        })
    }
    // 先手动触发一次，初始化state，后续的触发就是更改state
    dispatch({});
    return { subscribe, getState, dispatch }
}