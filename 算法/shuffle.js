// 随机洗牌
// 从后向前遍历,每个数应该随机到的几率都是1/n
// 等于 从后面开始,一直向前面冒泡
function shuffle(arr) {
    var _array = arr.slice();
    var rand, temp;
    for (var i = _array.length; i>0; i--) {
        // 对于最后的元素,应该有1/n的几率随机,随机完成后,应该占了这个坑,以后其他元素随机就以n-1为长度随机
        rand = Math.floor(Math.random()*(i+1));
        temp = _array[i];
        _array[i] = _array[rand];
        _array[rand] = temp;
    }
    return _array;
}

// 从前向后遍历？？？
function shuffle_v2(arr) {
    var length = arr.length;
    var shuffled = Array(length);
    for (var index=0, rand; index < length; index++) {
        rand = Math.floor(Math.random()*(index+1));
        if (rand !== index) {
            shuffled[index] = shuffle[rand];
            shuffle[rand] = a[index];
        }
    }
    return shuffled;
}

// slice版本,等于一叠排,你随机抽取组成新的牌
function shuffle_v3(arr) {
    var rand;
    var _array = [];
    while (arr.length) {
        rand = Math.floor(Math.random()*(arr.length+1));
        _array.push(arr[rand]);
        arr.splice(rand, 1);
    }
    return _array;
}