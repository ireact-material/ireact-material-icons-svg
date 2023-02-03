import { series, parallel, watch } from 'gulp';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import upperFirst from 'lodash.upperfirst';

import {
  clean,
  copy,
  generateIcons,
  generateEntry,
  generateInline
} from './tasks/creators';

// 通用配置
import { generalConfig } from './plugins/svgo/presets';

import {
  // 分配属性标签
  assignAttrsAtTag
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

// 获取exportIcon模版
const exportIconTemplate = `export { default as <%= identifier %> } from '<%= path %>';`;

// 获取index模版
const indexTemplate = `export * as <%= identifier %> from '<%= path %>';`;

export default series(
  // 1. 清理文件
  clean(['src', 'inline-svg', 'inline-namespaced-svg', 'es', 'lib']),

  // 2. 并行运行下列任务
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
      toDir: 'src/asn/baseline',
      // 图标压缩插件 svgo 的配置
      svgoConfig: generalConfig,
      // 对节点的额外转换
      // 是一个包含对节点进行额外处理的工厂函数数组 `TransformFactory[]`
      extraNodeTransformFactories: [
        // 对所有类型为 `svg` 的节点（即 `svg` 标签），赋值添加 `focusable="false"` 属性
        assignAttrsAtTag('svg', { focusable: 'false' })
      ],
      // 在套用模板前，对抽象节点的序列化操作
      stringify: JSON.stringify,
      // 套用的模板
      template: iconTemplate,
      // 模板中的插值映射
      mapToInterpolate: ({ name, content }) => ({
        // 获取标识符
        identifier: getIdentifier({ name }),
        content
      }),
      // 最后输出文件命名
      filename: ({ name }) => getIdentifier({ name })
    }),

    // 2.3 生成 outline 主题风格的图标抽象节点
    // 该任务将指定目录下的 `.svg` 文件，使用 `svgo` 进行图标压缩，然后将压缩后的图标解析成抽象节点
    generateIcons({
      // 告知生成图标的主题风格
      theme: 'outline',
      // 图标来源
      from: ['material-icons/outline/*.svg'],
      // 输出目录
      toDir: 'src/asn/outline',
      // 图标压缩插件 svgo 的配置
      svgoConfig: generalConfig,
      // 对节点的额外转换
      // 是一个包含对节点进行额外处理的工厂函数数组 `TransformFactory[]`
      extraNodeTransformFactories: [
        // 对所有类型为 `svg` 的节点（即 `svg` 标签），赋值添加 `focusable="false"` 属性
        assignAttrsAtTag('svg', { focusable: 'false' })
      ],
      // 在套用模板前，对抽象节点的序列化操作
      stringify: JSON.stringify,
      // 套用的模板
      template: iconTemplate,
      // 模板中的插值映射
      mapToInterpolate: ({ name, content }) => ({
        // 获取标识符
        identifier: getIdentifier({ name }),
        content
      }),
      // 最后输出文件命名
      filename: ({ name }) => getIdentifier({ name })
    }),

    // 2.4 生成 round 主题风格的图标抽象节点
    // 该任务将指定目录下的 `.svg` 文件，使用 `svgo` 进行图标压缩，然后将压缩后的图标解析成抽象节点
    generateIcons({
      // 告知生成图标的主题风格
      theme: 'round',
      // 图标来源
      from: ['material-icons/round/*.svg'],
      // 输出目录
      toDir: 'src/asn/round',
      // 图标压缩插件 svgo 的配置
      svgoConfig: generalConfig,
      // 对节点的额外转换
      // 是一个包含对节点进行额外处理的工厂函数数组 `TransformFactory[]`
      extraNodeTransformFactories: [
        // 对所有类型为 `svg` 的节点（即 `svg` 标签），赋值添加 `focusable="false"` 属性
        assignAttrsAtTag('svg', { focusable: 'false' })
      ],
      // 在套用模板前，对抽象节点的序列化操作
      stringify: JSON.stringify,
      // 套用的模板
      template: iconTemplate,
      // 模板中的插值映射
      mapToInterpolate: ({ name, content }) => ({
        // 获取标识符
        identifier: getIdentifier({ name }),
        content
      }),
      // 最后输出文件命名
      filename: ({ name }) => getIdentifier({ name })
    }),

    // 2.5 生成 sharp 主题风格的图标抽象节点
    // 该任务将指定目录下的 `.svg` 文件，使用 `svgo` 进行图标压缩，然后将压缩后的图标解析成抽象节点
    generateIcons({
      // 告知生成图标的主题风格
      theme: 'sharp',
      // 图标来源
      from: ['material-icons/sharp/*.svg'],
      // 输出目录
      toDir: 'src/asn/sharp',
      // 图标压缩插件 svgo 的配置
      svgoConfig: generalConfig,
      // 对节点的额外转换
      // 是一个包含对节点进行额外处理的工厂函数数组 `TransformFactory[]`
      extraNodeTransformFactories: [
        // 对所有类型为 `svg` 的节点（即 `svg` 标签），赋值添加 `focusable="false"` 属性
        assignAttrsAtTag('svg', { focusable: 'false' })
      ],
      // 在套用模板前，对抽象节点的序列化操作
      stringify: JSON.stringify,
      // 套用的模板
      template: iconTemplate,
      // 模板中的插值映射
      mapToInterpolate: ({ name, content }) => ({
        // 获取标识符
        identifier: getIdentifier({ name }),
        content
      }),
      // 最后输出文件命名
      filename: ({ name }) => getIdentifier({ name })
    }),

    // 2.6 生成 twotone 主题风格的图标抽象节点
    // 该任务将指定目录下的 `.svg` 文件，使用 `svgo` 进行图标压缩，然后将压缩后的图标解析成抽象节点
    generateIcons({
      // 告知生成图标的主题风格
      theme: 'twotone',
      // 图标来源
      from: ['material-icons/twotone/*.svg'],
      // 输出目录
      toDir: 'src/asn/twotone',
      // 图标压缩插件 svgo 的配置
      svgoConfig: generalConfig,
      // 对节点的额外转换
      // 是一个包含对节点进行额外处理的工厂函数数组 `TransformFactory[]`
      extraNodeTransformFactories: [
        // 对所有类型为 `svg` 的节点（即 `svg` 标签），赋值添加 `focusable="false"` 属性
        assignAttrsAtTag('svg', { focusable: 'false' })
      ],
      // 在套用模板前，对抽象节点的序列化操作
      stringify: JSON.stringify,
      // 套用的模板
      template: iconTemplate,
      // 模板中的插值映射
      mapToInterpolate: ({ name, content }) => ({
        // 获取标识符
        identifier: getIdentifier({ name }),
        content
      }),
      // 最后输出文件命名
      filename: ({ name }) => getIdentifier({ name })
    })
  ),

  // 3. 并行运行下列任务
  parallel(
    // 3.1 生成 baseline 入口文件 baseline.ts
    generateEntry({
      // 文件名称
      entryName: 'baseline.ts',
      // 输入目录
      from: ['src/asn/baseline/*.ts'],
      // 输出位置
      toDir: 'src',
      // 注释
      banner: '// This file is generated automatically.\n',
      // 模版
      template: exportIconTemplate,
      // 映射文件
      mapToInterpolate: ({ name: identifier }) => {
        return {
          identifier,
          path: `./asn/baseline/${identifier}`
        };
      }
    }),

    // 3.2 生成 outline 入口文件 outline.ts
    generateEntry({
      // 文件名称
      entryName: 'outline.ts',
      // 输入目录
      from: ['src/asn/outline/*.ts'],
      // 输出位置
      toDir: 'src',
      // 注释
      banner: '// This file is generated automatically.\n',
      // 模版
      template: exportIconTemplate,
      // 映射文件
      mapToInterpolate: ({ name: identifier }) => {
        return {
          identifier,
          path: `./asn/outline/${identifier}`
        };
      }
    }),

    // 3.3 生成 round 入口文件 round.ts
    generateEntry({
      // 文件名称
      entryName: 'round.ts',
      // 输入目录
      from: ['src/asn/round/*.ts'],
      // 输出位置
      toDir: 'src',
      // 注释
      banner: '// This file is generated automatically.\n',
      // 模版
      template: exportIconTemplate,
      // 映射文件
      mapToInterpolate: ({ name: identifier }) => {
        return {
          identifier,
          path: `./asn/round/${identifier}`
        };
      }
    }),

    // 3.4 生成 sharp 入口文件 sharp.ts
    generateEntry({
      // 文件名称
      entryName: 'sharp.ts',
      // 输入目录
      from: ['src/asn/sharp/*.ts'],
      // 输出位置
      toDir: 'src',
      // 注释
      banner: '// This file is generated automatically.\n',
      // 模版
      template: exportIconTemplate,
      // 映射文件
      mapToInterpolate: ({ name: identifier }) => {
        return {
          identifier,
          path: `./asn/sharp/${identifier}`
        };
      }
    }),

    // 3.5 生成 twotone 入口文件 twotone.ts
    generateEntry({
      // 文件名称
      entryName: 'twotone.ts',
      // 输入目录
      from: ['src/asn/twotone/*.ts'],
      // 输出位置
      toDir: 'src',
      // 注释
      banner: '// This file is generated automatically.\n',
      // 模版
      template: exportIconTemplate,
      // 映射文件
      mapToInterpolate: ({ name: identifier }) => {
        return {
          identifier,
          path: `./asn/twotone/${identifier}`
        };
      }
    }),

    // 3.6 生成内联图标 inline-svg
    generateInline({
      // 获取文件
      from: ['src/asn/**/*.ts'],
      // 输出路径
      toDir: ({ _meta }) => 'inline-svg',
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

    // 3.7 生成包含名字空间的内联图标 inline-namespaced-svg
    generateInline({
      // 获取文件
      from: ['src/asn/**/*.ts'],
      // 输出路径
      toDir: ({ _meta }) => 'inline-namespaced-svg',
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
  ),

  series(
    // 3.8 生成 index 入口文件 index.ts
    generateEntry({
      // 文件名称
      entryName: 'index.ts',
      // 输入目录
      from: ['src/*.ts'],
      // 输出位置
      toDir: 'src',
      // 注释
      banner: '// This file is generated automatically.\n',
      // 模版
      template: indexTemplate,
      // 映射文件
      mapToInterpolate: ({ name: identifier }) => {
        let _identifier = upperFirst(identifier);

        if (identifier === 'twotone') {
          _identifier = 'TwoTone';
        }

        return {
          identifier: _identifier,
          path: `./${identifier}`
        };
      }
    })
  )
);
