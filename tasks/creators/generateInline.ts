import { src, dest } from 'gulp';
import * as File from 'vinyl';

import { useRender } from '../../plugins';
import { RenderCustomData } from '../../plugins/render';
import { IconDefinition } from '../../templates/types';
import { HelperRenderOptions } from '../../templates/helpers';


// 提取正则表达式
export const ExtractRegExp = /({\s*".*});/;

// 生成内联选项
export interface GenerateInlineOptions {
  from: string[];
  toDir: (file: File & { _renderData?: RenderCustomData }) => string;
  getIconDefinitionFromSource: (raw: string) => IconDefinition;
  renderOptions?: HelperRenderOptions;
}

// 生成内联图标
export const generateInline = ({
  from,
  toDir,
  // 从源获取图标定义
  getIconDefinitionFromSource,
  renderOptions = {}
}: GenerateInlineOptions) =>
  function GenerateInline() {
    // 获取文件
    return src(from)
      .pipe(
        // 渲染方法
        useRender({
          getIconDefinitionFromSource,
          renderOptions
        })
      )
      // 输出
      .pipe(dest(toDir));
  };
