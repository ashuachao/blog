function Node(value) {
    this.value = value;
    // 下一个节点指向
    this.next = null;
}
// 创建一个环
function createLoop(sum, initial) {
    // 根节点
    var node;
    // 每次重新替换的新节点
    var node_tmp;
    initial = initial || 1;
    node = node_tmp = new Node(initial);
    for (var i=initial+1; i<=sum; i++) {
        node_tmp.next = new Node(i);
        node_tmp = node_tmp.next;
    }
    node_tmp.next = node;
    return node;
}
// 计算环里面元素的个数
function loopCount(loop, value) {
    var i = 1;
    while (loop.next.value != value) {
        loop = loop.next;
        i++;
    }
    console.log('loop length' + value, i);
    return i;
}
function joesefh(sum, n) {
    var node;
    // n=1的情况
    if (n == 1) {
        return sum;
    } else {
        node = createLoop(sum);
        while (loopCount(node, node.value) > 1) {
            for (var i=2; i<n; i++) {
                node = node.next
            }
            // 删除前的一个节点
            previousNode = node;
            // // 要删除的节点
            deleteNode = node.next;
            // remove 节点 , 断开链接
            // node.next = node.next.next;
            previousNode.next = deleteNode.next;
            // // 重置普攻
            node = node.next;
        }
        return node.value;
    }
}