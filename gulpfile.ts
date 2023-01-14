import { series, parallel } from 'gulp';
import { clean, copy, generateIcons } from './tasks/creators';
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
    generateIcons({
      theme: 'baseline',
      // 目标路径
      from: ['material-icons/baseline/*.svg'],
      // 输出路径
      toDir: 'src/asn',
      // svg 通用配置
      svgoConfig: generalConfig,
      // 额外的节点转换工厂
      extraNodeTransformFactories: [
        // 分配属性标签
        assignAttrsAtTag('svg', { focusable: 'false' }),
        // 调整ViewBox
        adjustViewBox
      ],
      // 字符串转换方法
      stringify: JSON.stringify,
      // icon模版
      template: iconTemplate,
      // 映射到插值
      mapToInterpolate: ({ name, content }) => ({
        // 获取标识符
        identifier: getIdentifier({ name, themeSuffix: 'Baseline' }),
        content
      }),
      // 文件名称
      filename: ({ name }) => getIdentifier({ name, themeSuffix: 'Baseline' })
    })
  )
);
