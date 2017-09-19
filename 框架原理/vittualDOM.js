// 主要研究react virtual-dom的实现
// react通过shouldComponentUpdate判断返回true触发render方法,然后生成v-d触发virtual-dom的dom-diff来比较,从而进行重新渲染
// VNode 虚拟节点,通过方法可以把Vnode生成dom节点
// Vtext 虚拟文本节点
// Vpatch 补丁对象,对某个节点的操作的描述
// 算法步骤
// 1. js模拟dom树, 2. 模拟树比较的差异, 3.通过patch把差异反映到dom树
/**
 * js对象模拟dom
 * 
 * @param {any} tagName
 * @param {any} props
 * @param {any} children
 */
function Element(tagName, props, children) {
    this.tagName = tagName;
    this.props = props;
    this.children = children;
}
/**
 * 把js对象生成真正的dom
 */
Element.prototype.render = function() {
    var el = document.createElement(this.tagName);
    var props = this.props;
    for (var i in props) {
        el.setAttribute(props, props[i])
    }
    var children = this.children || [];
    // 递归调用
    children.forEach(function (child) {
        var childEl = (child instanceof Element) ?  childEl.render() : document.createTextNode(child);
        el.appendChild(childEl);
    })
    return el;
}
// dom diff
function diff(oldTree, newTree) {
    // 当前节点的标志
    var index = 0;
    // 用来记录每个节点差异的对象
    var patches = {};
    dfsWalk(oldTree, newTree, index, patches);
    return patches;
}
function dfsWalk(oldTree, newTree, index, patches) {
    patches[index] = [...];
    diffChildren(oldTree.children, newTree.children, index, patches);
}
function diffChildren(oldChildren, newChildren, index, patched) {
    var leftNode = null;
    var currentNodeIndex = index;
    oldChildren.forEach(function(child, i) {
        var newChild = newChildren[i];
        currentNodeIndex = (leftNode && leftNode.count) ? currentNodeIndex + leftNode + 1 : currentNodeIndex + 1;
        dfsWalk(child, newChild, currentNodeIndex, patched);
        leftNode = child;
    })
}