
// 虚拟节点
export interface AbstractNode {
  // tag
  tag: string;
  // 属性
  attrs: {
    [key: string]: string;
  };
  // 子节点
  children?: AbstractNode[];
}

// 图标默认参数
export interface IconDefinition {
  // kebab-case-style
  name: string;
  theme: ThemeType;
  icon:
    | ((primaryColor: string, secondaryColor: string) => AbstractNode)
    | AbstractNode;
}

// 主题类型
export type ThemeType = 'baseline' | 'outline' | 'round' | 'twotone' | 'sharp';
export type ThemeTypeUpperCase = 'Baseline' | 'outline' | 'Round' | 'TwoTone' | 'Sharp';
