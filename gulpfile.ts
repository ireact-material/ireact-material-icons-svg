import { series, parallel } from 'gulp';
import {
  clean,
  copy,
  generateIcons,
  generateEntry,
  generateInline
} from './tasks/creators';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// 通用配置
import { generalConfig } from './plugins/svgo/presets';

import {
  // 分配属性标签
  assignAttrsAtTag,
  // 调整ViewBox
  adjustViewBox
} from './plugins/svg2Definition/transforms';

// 获取标识符
import { getIdentifier } from './utils';

// 提取正则表达式
import { ExtractRegExp } from './tasks/creators/generateInline';

// type
import { IconDefinition } from './templates/types';

// 获取icon模版
const iconTemplate = readFileSync(
  resolve(__dirname, './templates/icon.ts.ejs'),
  'utf8'
);

export default series(
  // 1. 清理文件
  clean(['src', 'inline-svg', 'es', 'lib']),

  // 2 并行运行下列任务
  parallel(
    // 2.1 直接拷贝部分代码至 src 目录，例如辅助函数 helpers.ts、类型定义 types.ts
    copy({
      from: ['templates/*.ts'],
      toDir: 'src'
    }),

    // 2.2 生成 baseline 主题风格的图标抽象节点
    // 该任务将指定目录下的 `.svg` 文件，使用 `svgo` 进行图标压缩，然后将压缩后的图标解析成抽象节点
    generateIcons({
      // 告知生成图标的主题风格
      theme: 'baseline',
      // 图标来源
      from: ['material-icons/baseline/*.svg'],
      // 输出目录
      toDir: 'src/asn',
      // 图标压缩插件 svgo 的配置
      svgoConfig: generalConfig,
      // 对节点的额外转换
      // 是一个包含对节点进行额外处理的工厂函数数组 `TransformFactory[]`
      extraNodeTransformFactories: [
        // 对所有类型为 `svg` 的节点（即 `svg` 标签），赋值添加 `focusable="false"` 属性
        assignAttrsAtTag('svg', { focusable: 'false' }),
        // 调整ViewBox
        adjustViewBox
      ],
      // 在套用模板前，对抽象节点的序列化操作
      stringify: JSON.stringify,
      // 套用的模板
      template: iconTemplate,
      // 模板中的插值映射
      mapToInterpolate: ({ name, content }) => ({
        // 获取标识符
        identifier: getIdentifier({ name, themeSuffix: 'Baseline' }),
        content
      }),
      // 最后输出文件命名
      filename: ({ name }) => getIdentifier({ name, themeSuffix: 'Baseline' })
    }),

    // 2.3 生成 outline 主题风格的图标抽象节点
    // 该任务将指定目录下的 `.svg` 文件，使用 `svgo` 进行图标压缩，然后将压缩后的图标解析成抽象节点
    generateIcons({
      // 告知生成图标的主题风格
      theme: 'outline',
      // 图标来源
      from: ['material-icons/outline/*.svg'],
      // 输出目录
      toDir: 'src/asn',
      // 图标压缩插件 svgo 的配置
      svgoConfig: generalConfig,
      // 对节点的额外转换
      // 是一个包含对节点进行额外处理的工厂函数数组 `TransformFactory[]`
      extraNodeTransformFactories: [
        // 对所有类型为 `svg` 的节点（即 `svg` 标签），赋值添加 `focusable="false"` 属性
        assignAttrsAtTag('svg', { focusable: 'false' }),
        // 调整ViewBox
        adjustViewBox
      ],
      // 在套用模板前，对抽象节点的序列化操作
      stringify: JSON.stringify,
      // 套用的模板
      template: iconTemplate,
      // 模板中的插值映射
      mapToInterpolate: ({ name, content }) => ({
        // 获取标识符
        identifier: getIdentifier({ name, themeSuffix: 'Outline' }),
        content
      }),
      // 最后输出文件命名
      filename: ({ name }) => getIdentifier({ name, themeSuffix: 'Outline' })
    }),

    // 2.4 生成 round 主题风格的图标抽象节点
    // 该任务将指定目录下的 `.svg` 文件，使用 `svgo` 进行图标压缩，然后将压缩后的图标解析成抽象节点
    generateIcons({
      // 告知生成图标的主题风格
      theme: 'round',
      // 图标来源
      from: ['material-icons/round/*.svg'],
      // 输出目录
      toDir: 'src/asn',
      // 图标压缩插件 svgo 的配置
      svgoConfig: generalConfig,
      // 对节点的额外转换
      // 是一个包含对节点进行额外处理的工厂函数数组 `TransformFactory[]`
      extraNodeTransformFactories: [
        // 对所有类型为 `svg` 的节点（即 `svg` 标签），赋值添加 `focusable="false"` 属性
        assignAttrsAtTag('svg', { focusable: 'false' }),
        // 调整ViewBox
        adjustViewBox
      ],
      // 在套用模板前，对抽象节点的序列化操作
      stringify: JSON.stringify,
      // 套用的模板
      template: iconTemplate,
      // 模板中的插值映射
      mapToInterpolate: ({ name, content }) => ({
        // 获取标识符
        identifier: getIdentifier({ name, themeSuffix: 'Round' }),
        content
      }),
      // 最后输出文件命名
      filename: ({ name }) => getIdentifier({ name, themeSuffix: 'Round' })
    }),

    // 2.5 生成 sharp 主题风格的图标抽象节点
    // 该任务将指定目录下的 `.svg` 文件，使用 `svgo` 进行图标压缩，然后将压缩后的图标解析成抽象节点
    generateIcons({
      // 告知生成图标的主题风格
      theme: 'sharp',
      // 图标来源
      from: ['material-icons/sharp/*.svg'],
      // 输出目录
      toDir: 'src/asn',
      // 图标压缩插件 svgo 的配置
      svgoConfig: generalConfig,
      // 对节点的额外转换
      // 是一个包含对节点进行额外处理的工厂函数数组 `TransformFactory[]`
      extraNodeTransformFactories: [
        // 对所有类型为 `svg` 的节点（即 `svg` 标签），赋值添加 `focusable="false"` 属性
        assignAttrsAtTag('svg', { focusable: 'false' }),
        // 调整ViewBox
        adjustViewBox
      ],
      // 在套用模板前，对抽象节点的序列化操作
      stringify: JSON.stringify,
      // 套用的模板
      template: iconTemplate,
      // 模板中的插值映射
      mapToInterpolate: ({ name, content }) => ({
        // 获取标识符
        identifier: getIdentifier({ name, themeSuffix: 'Sharp' }),
        content
      }),
      // 最后输出文件命名
      filename: ({ name }) => getIdentifier({ name, themeSuffix: 'Sharp' })
    }),

    // 2.6 生成 twotone 主题风格的图标抽象节点
    // 该任务将指定目录下的 `.svg` 文件，使用 `svgo` 进行图标压缩，然后将压缩后的图标解析成抽象节点
    generateIcons({
      // 告知生成图标的主题风格
      theme: 'twotone',
      // 图标来源
      from: ['material-icons/twotone/*.svg'],
      // 输出目录
      toDir: 'src/asn',
      // 图标压缩插件 svgo 的配置
      svgoConfig: generalConfig,
      // 对节点的额外转换
      // 是一个包含对节点进行额外处理的工厂函数数组 `TransformFactory[]`
      extraNodeTransformFactories: [
        // 对所有类型为 `svg` 的节点（即 `svg` 标签），赋值添加 `focusable="false"` 属性
        assignAttrsAtTag('svg', { focusable: 'false' }),
        // 调整ViewBox
        adjustViewBox
      ],
      // 在套用模板前，对抽象节点的序列化操作
      stringify: JSON.stringify,
      // 套用的模板
      template: iconTemplate,
      // 模板中的插值映射
      mapToInterpolate: ({ name, content }) => ({
        // 获取标识符
        identifier: getIdentifier({ name, themeSuffix: 'TwoTone' }),
        content
      }),
      // 最后输出文件命名
      filename: ({ name }) => getIdentifier({ name, themeSuffix: 'TwoTone' })
    }),
  ),

  // 并行运行下列任务
  parallel(
    // 3.1 生成入口文件 index.ts
    generateEntry({
      // 文件名称
      entryName: 'index.ts',
      // 输入目录
      from: ['src/asn/*.ts'],
      // 输出位置
      toDir: 'src',
      // 注释
      banner: '// This index.ts file is generated automatically.\n',
      // 模版
      template: `export { default as <%= identifier %> } from '<%= path %>';`,
      // 映射文件
      mapToInterpolate: ({ name: identifier }) => ({
        identifier,
        path: `./asn/${identifier}`
      })
    }),

    // 生成内联图标 inline-svg
    generateInline({
      // 获取文件
      from: ['src/asn/*.ts'],
      // 输出路径
      toDir: ({ _meta }) => `inline-svg/${_meta && _meta.theme}`,
      // 从源获取图标定义
      getIconDefinitionFromSource: (content: string): IconDefinition => {
        // svg文件源数据
        const extract = ExtractRegExp.exec(content);

        // 无法解析原始图标定义
        if (extract === null || !extract[1]) {
          throw new Error('Failed to parse raw icon definition: ' + content);
        }
        return new Function(`return ${extract[1]}`)() as IconDefinition;
      }
    }),

    // 3.3 生成包含名字空间的内联图标 inline-namespaced-svg
    generateInline({
      // 获取文件
      from: ['src/asn/*.ts'],
      // 输出路径
      toDir: ({ _meta }) => `inline-namespaced-svg/${_meta && _meta.theme}`,
      // 从源获取图标定义
      getIconDefinitionFromSource: (content: string): IconDefinition => {
        // svg文件源数据
        const extract = ExtractRegExp.exec(content);

        // 无法解析原始图标定义
        if (extract === null || !extract[1]) {
          throw new Error('Failed to parse raw icon definition: ' + content);
        }

        return new Function(`return ${extract[1]}`)() as IconDefinition;
      },
      // 输入到文件的额外内容
      renderOptions: {
        extraSVGAttrs: { xmlns: 'http://www.w3.org/2000/svg' }
      }
    })
  )
);
