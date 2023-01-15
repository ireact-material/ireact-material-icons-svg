import { createTrasformStream } from '../creator';
import {
  renderIconDefinitionToSVGElement,
  HelperRenderOptions
} from '../../templates/helpers';
import { IconDefinition, ThemeType } from '../../templates/types';

export interface RenderOptions {
  getIconDefinitionFromSource: (raw: string) => IconDefinition;
  renderOptions: HelperRenderOptions;
}

export interface RenderCustomData {
  theme: ThemeType;
}

// 渲染方法
export const useRender = ({
  getIconDefinitionFromSource,
  renderOptions
}: RenderOptions) =>
  // 创建转换流
  createTrasformStream((content, file) => {
    // 从源获取图标定义
    const def = getIconDefinitionFromSource(content);

    // 后缀
    file.extname = '.svg';
    // 文件内容
    file.stem = def.name;
    // 主题
    file._meta = {
      theme: def.theme
    } as RenderCustomData;

    // 将 SVG 渲染到 icon 组件
    return renderIconDefinitionToSVGElement(def, renderOptions);
  });
