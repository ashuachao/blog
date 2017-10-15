// MVVM
// 观察者模式加数据劫持
// 观察者: callback:页面的改变
// 发布者: option:数据自身的set
// 什么时候添加listener: 在数据get的时候添加对页面变更的listener
// 什么时候发布listener: 在数据set的时候调用对应get时候存储的listener
// sample Obeserve({})

// 将数据自身的get和set进行数据劫持,变成具有观察功能的数据
function observe(obj, vm) {
    Object.keys(obj).forEach(function (key) {
        defineReactive(vm, key, obj[key]);
    })
}
function defineReactive(obj, key, value) {
    // 通过闭包 保存依赖
    var dep = new Dep();
    Object.defineProperty(obj, key, {
        // 第一次应该添加观察者,应该只观察一次
        // 观察者应该有update方法
        get: function() {
            if (Dep.target) {
                dep.addListener(Dep.target);
            }
            return value;
        }, 
        set: function(newVal) {
            if (newVal == value) {
                return;
            }
            // 更新闭包变量
            value = newVal;
            dep.emit();
        }
    })
}
// 维护观察者
function Watch(vm, node, name, type) {
    Dep.target = this;
    this.node = node;
    this.vm = vm;
    this.name = name;
    this.update();
    Dep.target = null;
}
Watch.prototype.update = function() {
    // 触发数据的get添加观察者
    this.get();
    this.node[this.type] = this.value;
}
Watch.prototype.get = function() {
    this.value = this.vm[this.name];
}
// 维护一个依赖收集器
function Dep() {
    this.listeners = [];
}
Dep.prototype.addListener = function(listener) {
    this.listeners.push(listener);
}
Dep.prototype.emit = function() {
    this.listeners.forEach(function (listener) {
        listener.update();
    })
}
// 编译dom的函数,依赖收集
function Compile(node, vm) {
    var fragment = document.createDocumentFragment;
    var child;
    // firstChild指向第一个子节点,appendChild之后会在原节点移除,如此循环,便可将node节点移植到frag
    while (child = node.firstChild) {
        this.compileElement(child, vm);
        fragment.append(child);
    }
    return fragment;
}
Compile.prototype.compileElement = function (node, vm){
    // 节点类型为元素
    if (node.nodeType === 1) {
        var attr = node.attributes;
        for (var i=0; i<attr.length; i++) {
            if (attr[i].nodeName == 'v-model') {
                // 获得v-model绑定的属性名
                var name = attr[i].nodeValue;
                node.addEventListener('input', function(e) {
                    vm.data[name] = e.target.value;
                })
                // 初始化赋值,添加listener
                new Watch(vm, node, name, 'value');
                node.removeAttribute('v-model')
            }
        }
        // 文本类型的几点
    } else if (node.nodeType === 3) {
        if (/^\{\{(\.*)\}\}$/.test(node.nodeValue)) {
            var name = RegExp.$1;
            name = name.trim();
            new Watch(vm, node, name, 'nodeValue');
        }
    }
}

function Vue(options) {
    this.data = options.data;
    var data = this.data;
    var id = option.els;
    // 对数据赋予自身的一个监测功能
    observe(data, this);
    var dom = new Compile(document.getElementById(id), this);
    document.getElementById(id).appendChild(dom);
}