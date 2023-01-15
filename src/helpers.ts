import { IconDefinition, AbstractNode } from './types';

// 默认颜色
const defaultColors = {
  primaryColor: '#000000',
  secondaryColor: '#B3B3B3'
};

// 帮助渲染选项
export interface HelperRenderOptions {
  // 占位符
  placeholders?: {
    primaryColor: string;
    secondaryColor: string;
  };
  // SVG 属性
  extraSVGAttrs?: {
    [key: string]: string;
  };
}

// 将 SVG 渲染到 icon 组件
export function renderIconDefinitionToSVGElement(
  iconDefinition: IconDefinition,
  options: HelperRenderOptions = {}
): string {
  // 双色图标
  if (typeof iconDefinition.icon === 'function') {
    const placeholders = options.placeholders || defaultColors;

    return renderAbstractNodeToSVGElement(
      iconDefinition.icon(
        placeholders.primaryColor,
        placeholders.secondaryColor
      ),
      options
    );
  }

  // 其他
  return renderAbstractNodeToSVGElement(iconDefinition.icon, options);
}

// 将抽象节点渲染到 SVG 元素
function renderAbstractNodeToSVGElement(
  // 抽象节点
  node: AbstractNode,
  // 帮助渲染选项
  options: HelperRenderOptions
): string {
  // tag 属性
  const targetAttrs =
    node.tag === 'svg'
      ? {
          ...node.attrs,
          ...(options.extraSVGAttrs || {})
        }
      : node.attrs;

  // 属性
  const attrs = Object.keys(targetAttrs).reduce(
    (currentKey: string[], nextKey) => {
      const key = nextKey;
      const value = targetAttrs[key];
      const token = `${key}="${value}"`;

      currentKey.push(token);

      return currentKey;
    },
    []
  );

  // 属性 token
  const attrsToken = attrs.length ? ' ' + attrs.join(' ') : '';

  // 子节点
  const children = (node.children || [])
    .map((child) => renderAbstractNodeToSVGElement(child, options))
    .join('');

  // 有子节点
  if (children && children.length) {
    return `<${node.tag}${attrsToken}>${children}</${node.tag}>`;
  }

  // 其他节点
  return `<${node.tag}${attrsToken} />`;
}
