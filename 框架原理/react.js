// react原理简析
// MVC层中的view (负责template的更新工作，提供ui层的解决方案，即根据数据显示形态) controller(负责controll数据层) model(负责数据层的连接，数据获取)
// 组件化解决的问题: 前端的复用性
// 数据变化的时候, ,组件化的模式提供自动化的方式更新页面(Component的_renderDOM方法)
// jsx->js对象结构的描述->ReactDOM.render()[在第一次render和setState的时候会调用,将第二部的js对象结构转换成真正的可以解析的结构]
// 自定义组件开头用大写字母,普通HTML标签用小写字母开头
// 通过事件调用方法的时候,不是通过this.onclick调用的,而是通过函数直接调用onclick,所以获取不到this实例.可以手动使用this.onclick.bind(this)绑定当前实例到作用域中
// 在constructor的时候可以通过this.state={}设置第一次state(可以在构造函数的时候使用defineProperty定义setter,第一次调用过后翻转状态,以后只允许setState调用来改变状态)
// 在一次事件循环之后才回去更新state的值,具体讲改变的东西传入promise队列
// React将组件渲染，并且构造DOM元素然后塞入页面的过程叫组件的挂载
/**
 * 过程
 * constructor()
 * componentWillMount()
 * render()//渲染成jsxobj
 * 根据jsxobj构建dom插入页面
 * componentDidMount()
 */
// dangerouslySetInnerHTML(__html属性等于innerhtml),不会被转义
// style是一个对象,例style={{'fontSize: '12px', background: 'red'}}
// 通过proptypes验证传入的参数,prop-types库(通过静态属性static定义)
// 高阶组件就是为了代码的复用(接受组件作为参数,返回新的组件,可以做一些配置化,初始化的东西)(传进去的组件通过props接受高阶组件传进去的参数)
// 某个组件的contetx会被这个组件下所有子组件共享,所以redux-react将store和context连接起来作为顶端组件,被所有子组件共享状态(子组件要访问context需要通过contextTypes验证声明需要的类型)
function createDOMFromString(str) {
    const div = document.createElement('div');
    div.innerHTML = str;
    return div;
}
class Component{
    setState(state) {
        this.oldEl = this.el;
        this.state = state;
        this.el = this._renderDOM();
        if (this.onStateChange) {
            this.onStateChange(oldEl, newEl);
        }
    }
    // 组件的方法,在setState的时候自动调用,利用继承,调用专用组件的
    _renderDOM() {
        this.el = createDOMFromString(this.render());
        if (this.onClick) {
            this.el.addEventListener('click', this.onClick.bind(this), false);
        }
        return this.el;
    }
}
const mount = (component, wrapper) => {
    wrapper.appendChild(component._renderDOM());
    component.onStateChange = (oldEl, newEl) => {
        wrapper.insertBefore(newEl, oldEl);
        wrapper.removeChild(oldEl);
    }
}
class LikeButton extends Component{
    constructor(props) {
        super(props);
        this.props = props;
        this.state = { isLiked: false };
    }
    onClick() {
        this.setState({
            isLiked: !this.state.isLiked
        })
    }
    render() {
        return `
            <button class='like-btn' style='background-color: ${this.props.bgColor}'>
                <span class='like-text'>${this.state.isLiked? '取消': '点赞'}</span>
            </button>
        `
    }
}
mount(new LikeButton({
    bgColor: 'red'
}), wrapper);



function shallowEquall(x, y) {
    function is(x, y) {
        if (x === y) {
            // 用1/x === 1/y区分0,-0
            return x !== 0 || y !== 0 || 1/x === 1/y;
        } else {
            // 比较NaN,NaN
            return x !== x && y !== y;
        }
    }
    const hasOwn = Object.prototype.hasOwnProperty;
    if (is(x, y)) return true;
    // 第一步比较基本类型，这一步比较引用类型
    if (typeof x !== 'object' || x === null ||
        typeof y !== 'object' || y === null) {
        return false;
    }
    const keysA = Object.keys(x);
    const keysB = Object.keys(y);
    if (keysA.length !== keysB.length) return false;
    for (let i=0; i<keysA.length; i++) {
        // 比较非枚举类型是否存在对象中,并递归检测非第一层
        if (!hasOwn.call(keysB, keysA[i]) ||
            !is(x[keysA[i]], y[keysA[i]])) {
            return false;
        }
    }
    return true;
}