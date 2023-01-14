import { src, dest } from 'gulp';
import SVGO from 'svgo';
import rename from 'gulp-rename';

// SVG定义选项
import { SVG2DefinitionOptions } from '../../plugins/svg2Definition';
// 使用模版选项
import { UseTemplatePluginOptions } from '../../plugins/useTemplate';
import { svg2Definition, svgo, useTemplate } from '../../plugins';

// 生成图标选项
export interface GenerateIconsOptions
  extends SVG2DefinitionOptions,
    UseTemplatePluginOptions {
  from: string[];
  toDir: string;
  svgoConfig: SVGO.Options;
  filename: (option: { name: string }) => string;
}

// 生成图标
export const generateIcons = (
  // 生成图标选项
  {
    from,
    toDir,
    svgoConfig,
    theme,
    extraNodeTransformFactories,
    stringify,
    template,
    mapToInterpolate,
    filename
  }: GenerateIconsOptions
) =>
  function GenerateIcons() {
    // 图标路径
    return (
      src(from)
        // svg选项
        .pipe(svgo(svgoConfig))
        .pipe(
          // svg定义
          svg2Definition({
            theme,
            extraNodeTransformFactories,
            stringify
          })
        )
        // 使用模版
        .pipe(useTemplate({ template, mapToInterpolate }))
        // 重名文件
        .pipe(
          rename((file) => {
            if (file.basename) {
              file.basename = filename({ name: file.basename });
              file.extname = '.ts';
            }
          })
        )
        .pipe(dest(toDir))
    );
  };
