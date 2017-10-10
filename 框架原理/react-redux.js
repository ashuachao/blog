// 解决状态被多个组件依赖和影响的情况,结合react和redux,让react拥有一种比较高门槛更改的一种共享数据
// 把redux的store和context连接到一起,利用context可以被子组件共享的特性,利用redux修改的高门槛,实现了上述需求
// 通过编写高阶组件connect(从context里面取state)
// 用一个Provider(空组件)去初始化context和store的连接工作,让子组件都可以共享到数据
// 解决的问题: 1.组件之间的数据共享状态 2.共享状态不可以被任意修改(通过redux的高门槛修改方法)
const connect = (mapStateToProps, mapDispatchToProps) => (WrapperComponent) => {
    // 需要一个参数告诉组件如何触发dispatch
    class Connect extends Components{
        static contextProps = {
            store: PropTypes.object
        }
        constructor(props) {
            super(props);
            this.state = { allProps: {} };
        }
        componentWillMount() {
            const { store } = this.context;
            store.subscribe(() => this._updateProps())
        }
        _updateProps() {
            const { store } = this.context
            // 将store作为参数，返回组件需要的数据作为props传进去
            let stateProps = mapStateToProps
                ? mapStateToProps(store.getState(), this.props)// 额外传入 props，让获取数据更加灵活方便
                : {} // 防止 mapStateToProps 没有传入
            let dispatchProps = mapDispatchToProps
                ? mapDispatchToProps(store.dispatch, this.props)
                : {} 
            this.setState({
                allProps: { // 整合普通的 props 和从 state 生成的 props
                ...stateProps,
                ...this.props
                }
            })
        }
        render () {
           return <WrappedComponent {...this.state.allProps} />
        }
    }
    return Connect;
}