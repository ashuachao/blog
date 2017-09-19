## 框架接口设计

### 方便的调用方式
1. _.methods(params) 属于类的调用方式,静态方法调用
2. _(params).method 属于实例调用
3. (new _(params)).methods 属于实例化类的对象之后调用

### 实现
```
function _(params) {
    // params已经是一个_对象了,直接返回
    if (params instanceof _) return params;
    // 很巧妙的一种方式, 在_()调用的时候,this指向window, return new _params, 
    // 第二次调用_ 然后new 里面 this 指向 _, 退出死循环,并且把params变量保存在this.wrapped
    if (!this instanceof _) return new _(params);
    this.wrapped = params;
}
// 最后_(params)返回的是new _params,即{ wrapped: params, ...methods}
```

### 实现静态方法和原型方法的转换
1. 假设已经定义了很多静态方法 [..._.methods]
2. 静态方法映射到实例方法
```
let func, args;
Object.keys(methods).forEach((method) => {
    func = methods[method];
    args = this.wrapped;
    [].push.apply(args, arguments);
    _.prototype[method] = methods[method].apply(_, args); 
})
```