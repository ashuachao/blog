/**
 * 讲二位数组降阶为一维数组
 * @param
 */
function flatten(arr) {
    return arr.reduce((pre, val) => {
        pre.concat(
            Array.isArray(val)? 
            flatten(val) : val
        ) 
    }, [])
}
/**
 * reduce的pollyfill
 */
function reduce(arr, func, initialValue) {
    var base = initialValue === 'undefined' ? arr[0] : initialValue;
    var startPoint = initialValue === 'undefined' ? 1 : 0;
    arr.slice(startPoint).forEach(function (item, index) {
        base = func(base, item, startPoint+index, arr);
    })
    return base;
}
/**
 * 深层次的数据读取
 * @param dataList 数据的读取链  ['a', 'b', 0]
 * @param dataSource 数据源
 */
function getDataDeep(dataList, dataSource) {
    // dataSource? dataSource[arr[0]]? dataSource[arr[0]][arr[1]]?
    return dataList.reduce((xs, x) => 
        (xs && xs[x]) ? xs[x] : null, dataSource)
}