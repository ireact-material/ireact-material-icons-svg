var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
// 默认颜色
var defaultColors = {
    primaryColor: '#000000',
    secondaryColor: '#B3B3B3'
};
// 将 SVG 渲染到 icon 组件
export function renderIconDefinitionToSVGElement(iconDefinition, options) {
    if (options === void 0) { options = {}; }
    // 双色图标
    if (typeof iconDefinition.icon === 'function') {
        var placeholders = options.placeholders || defaultColors;
        return renderAbstractNodeToSVGElement(iconDefinition.icon(placeholders.primaryColor, placeholders.secondaryColor), options);
    }
    // 其他
    return renderAbstractNodeToSVGElement(iconDefinition.icon, options);
}
// 将抽象节点渲染到 SVG 元素
function renderAbstractNodeToSVGElement(
// 抽象节点
node, 
// 帮助渲染选项
options) {
    // tag 属性
    var targetAttrs = node.tag === 'svg'
        ? __assign(__assign({}, node.attrs), (options.extraSVGAttrs || {})) : node.attrs;
    // 属性
    var attrs = Object.keys(targetAttrs).reduce(function (currentKey, nextKey) {
        var key = nextKey;
        var value = targetAttrs[key];
        var token = "".concat(key, "=\"").concat(value, "\"");
        currentKey.push(token);
        return currentKey;
    }, []);
    // 属性 token
    var attrsToken = attrs.length ? ' ' + attrs.join(' ') : '';
    // 子节点
    var children = (node.children || [])
        .map(function (child) { return renderAbstractNodeToSVGElement(child, options); })
        .join('');
    // 有子节点
    if (children && children.length) {
        return "<".concat(node.tag).concat(attrsToken, ">").concat(children, "</").concat(node.tag, ">");
    }
    // 其他节点
    return "<".concat(node.tag).concat(attrsToken, " />");
}
