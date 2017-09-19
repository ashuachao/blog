### commonsChunk配置及应用场景分析(踩坑)

1. 单入口文件入口的时候引用多次的文件不能被打包到chunk.js(minChunks默认的情况下,因为只有一个入口文件,所以没有公共引用。入口文件内的公共引用会通过modules的缓存,不会被分离)   
webpack.config.js
```
module.exports= {
    entry: {
        main: path.resolve(__dirname, './main.js')
    },
    output: {
        path: path.resolve(__dirname, './output'),
        filename: '[name].bundle.js'
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'chunk'
        })
    ]
}
```
```
// main.js
const chunk1 = require('./chunk1');
const chu nk2 = require('./chunk2')

// chunk1
const chunk2 = require('./chunk2')
module.exports = 'chunk1';

// chunk2
module.exports = 'chunk2';
```
-------------------输出
```
// chunk.bundle: main和chunk1都引用了chunk2,但是chunk2没有被打包进chunk
(function(modules) { 
    // webpackBootstrap
})([])

// main.bundle
webpackJsonp([0],[
    /* 0 */
/***/ (function(module, exports) {

    module.exports = 'chunk2';

    /***/ }),
    /* 1 */
/***/ (function(module, exports, __webpack_require__) {

    const chunk1 = __webpack_require__(2);
    const chunk2 = __webpack_require__(0);

    /***/ }),
    /* 2 */
/***/ (function(module, exports, __webpack_require__) {

    const chunk2 = __webpack_require__(0);
    module.exports = 'chunk1';

    /***/ })
],[1]);
```

2. 多入口文件入口引用多次的文件可以被打包进chunk.js  
webpack.config.js
```
module.exports= {
    entry: {
        main: path.resolve(__dirname, './main.js'),
        main1: path.resolve(__dirname, './main1.js')
    },
    output: {
        path: path.resolve(__dirname, './output'),
        filename: '[name].bundle.js'
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'chunk'
        })
    ]
}
```
```
// main.js
const chunk1 = require('./chunk1');
const chunk2 = require('./chunk2')

// main1.js
const chunk1 = require('./chunk1');
const chunk2 = require('./chunk2');

// chunk1
module.exports = 'chunk1';

//chunk2
module.exports = 'chunk2';
```
-------------------输出
```
// chunk.bundle: main和main1都引用了chunk1, chunk2, chunk打包了chunk1,chunk2
(function(modules) { 
    // webpackBootstrap
})
([
    (function(module, exports) {

    // const chunk2 = require('./chunk2')
    module.exports = 'chunk1';

    /***/ }),
    /* 1 */
    /***/ (function(module, exports) {

    module.exports = 'chunk2';

    /***/ })
])

// main.bundle
webpackJsonp([1],{

/***/ 2:
/***/ (function(module, exports, __webpack_require__) {

const chunk1 = __webpack_require__(0);
const chunk2 = __webpack_require__(1)

/***/ })

},[2]);

// main1.bundle
webpackJsonp([0],{

/***/ 3:
/***/ (function(module, exports, __webpack_require__) {

const chunk1 = __webpack_require__(0);
const chunk2 = __webpack_require__(1);

/***/ })

},[3]);
```

3. name为数组的情况  
webpack.config.js
```
module.exports= {
    entry: {
        main: path.resolve(__dirname, './main.js'),
        main1: path.resolve(__dirname, './main1.js'),
    },
    output: {
        path: path.resolve(__dirname, './output'),
        filename: '[name].bundle.js'
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: ['chunk', 'load']
        })
    ]
}
```
---------------------输出  
将符合引用次数的模块打包数组的第一个块(chunk.bundle)  
最后一个块包含webpack的加载模块的代码(load.bundle)
```
// chunk.bundle
webpackJsonp([0],[
/* 0 */
/***/ (function(module, exports) {

// const chunk2 = require('./chunk2')
module.exports = 'chunk1';

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = 'chunk2';

/***/ })
]);

// load.bundle
(function(modules) { 
    // webpackBootstrap
})
```

4. name为数组是key为entry中的key
```
module.exports= {
    entry: {
        main: path.resolve(__dirname, './main.js'),
        main1: path.resolve(__dirname, './main1.js'),
        chunk1: path.resolve(__dirname, './chunk2.js')
    },
    output: {
        path: path.resolve(__dirname, './output'),
        filename: '[name].bundle.js'
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: ['chunk1']
        })
    ]
}
```
经实践:分如下集中情况  
1. name为['chunk1'] => 打包的时候重写chunk1,只打包其余chunk(main&&main1)的公共模块
2. name为['chunk2', 'chunk1'] => 打包的时候chunk1包含的是自身,chunk2打包的是除去chunk1之后的公共模块
3. 当entry只有{mian, chunk1}的时候,  
    1. name为['chunk1'] => 打包的时候chunk1只包含自身,这就是我们常用单入口分离公共类库的方式
    2. name为['chunk1', 'chunk2'] => chunk1包含自身,chunk2只包含webpackBootstrap
    3. name为['chunk2', 'chunk1'] => chunk1包含自身,chunk2不会生成(因为除去chunk1之后只有main一个入口文件,不会有公共引用)
4. 当minChunks为Infinity时,会马上生成公共chunk,使得1不成立,chunk只包含自身.

## 总结:
1. 单入口文件分离类库的时候定义entry{app, common}, name设置['common']
2. 多入口文件分离类库的时候定义entry{app, app1, common}, name设置['chunk', 'common', 'load'],即common放在name[0]之后
3. 多入口文件分离类库的时候定义entry{app, app1, common}, name设置['common'],设置minChunks为infinity也可以达到common只包含类库自身


