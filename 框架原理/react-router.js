// Route用来渲染UI，通过childcontext上下文将history传递下去
// Link允许更新URL，并发布让Route根据新的URL改变UI(Link做了改变URL并改变历史堆栈，并且组织a标签的默认行为和发布信息(改变context.history)让Route渲染UI)
// 一般只有两种方式更新URL： 用户点击a/点击前进后退
class Route extends Component{
    componentWillMount() {
        // 通过History的listen监听事件(兼容)
        addEventListener('popstate', this.handlePop);
        // 订阅路由的变化，route跟踪
        register(this);
    }
    componentWillUnmount() {
        removeEventListener('popstate', this.handlePop);
        unregister(this);
    }
    handlePop() {
        // 所有的Route都会监听popstate
        // forceUpdate会调用render
        this.forceUpdate();
    }
    render() {
        const { path, exact, component, render } = this.props;
        const matchPath = (pathname, options) => {
            const { exact = false, path } = options;
            if (!path) {
                return {
                    path: null,
                    url: pathname,
                    isExact: true
                }
            }
            const match = new RegExp(`^${path}`).exec(pathname);
            if (!match) {
                return null;
            }
            const url = match[0];
            const isExact = pathname === url;
            if (exact && !isExact) {
                return null;
            }
            return {
                path,
                url,
                isExact
            }
        }
        // 比较是不是match
        // pathname指的是www.a.com/pathname
        const match = matchPath(
            location.pathname,
            { path, exact }
        )
        if (!match) {
            return null;
        }
        if (component) {
            // 如果匹配了path的地址,通过component创建新元素
            return React.createElement(component, { match })
        }
        if (render) {
            return render({ match })
        }
        return null;
    }
}

class Link extends Component{
    handleClick(event){
        const historyPush = (path) => {
            history.pushState({}, null, path);
            instances.forEach((instance) => { instance.forceUpdate() });
        }
        const historyReplace = (path) => {
            history.replaceState({}, null, path);
            instances.forEach((instance) => { instance.forceUpdate() });
        }
        const { replace, to } = this.props;
        event.preventDefault();
        replace? historyReplace(to): historyPush(to)
    }
    render() {
        const { to, chilren } = this.props;
        return (
            <a href={to} onClick={this.handleClick}>
                {children}
            </a>
        )
    }
}

// 观察者模式
let instances = [];
const register = (comp) => { instances.push(comp) };
const unregister = (comp) => { instances.splice(instances.indexOf(comp), 1) };