import { src, dest } from 'gulp';
import concat from 'gulp-concat';
import header from 'gulp-header';

import { useTemplate } from '../../plugins';
import { UseTemplatePluginOptions } from '../../plugins/useTemplate';

// 生成条目选项
export interface GenerateEntryOptions extends UseTemplatePluginOptions {
  from: string[];
  toDir: string;
  entryName: string;
  banner?: string;
}

// 生成条目
export const generateEntry = ({
  from,
  toDir,
  template,
  mapToInterpolate,
  entryName,
  banner = ''
}: GenerateEntryOptions) =>
  function GenerateEntry() {
    return src(from)
      .pipe(
        // 使用模版
        useTemplate({
          template,
          mapToInterpolate
        })
      )
      // 重命名
      .pipe(concat(entryName))
      // 在文件头部添加内容
      .pipe(header(banner))
      .pipe(dest(toDir));
  };
