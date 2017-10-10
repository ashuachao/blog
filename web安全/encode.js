// 对输出的内容进行encode转义,防止XSS
function htmlEncode(str) {
    var hex = new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e','f');
    var preescape = str;
    var escape = '';
    for (var i=0; i<preescape.length; i++) {
        var p = preescape.charAt(i);
        escape += escapeCharx(p);
    }
    return escape;
    function escapeCharx(original) {
        var found = true;
        // 获得ASCII码
        var thechar = original.charCodeAt(0);
        switch(thechar) {
            case '10': return '<br/>';//new Line \n
            case '32': return '&nbsp;';// space
            case '34': return '&quot;';// "
            case '38': return '&amp;';// &
            case '39': return '&#x27;';// '
            case '47': return '$#x2F;';// /
            case '60': return '&lt;';// <
            case '62': return '&gt;';// >
            default: 
                found = false;
                break;
        }
        if (!found) {
            if (thechar > 127) {
                var c = thechar;
                // 16进制 整除法  0080 
                var a4 = c%16; 0
                c = Math.floor(c/16); 
                var a3 = c%16;
                c = Math.floor(c/16);
                var a2 = c%16;
                c = Math.floor(c/16);
                var a1 = c%16;
                return "&#x"+hex[a1]+hex[a2]+hex[a3]+hex[a4]+";"; 
            } else {
                return original;
            }
        }
    }
}