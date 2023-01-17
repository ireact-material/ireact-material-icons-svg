import SVGO from 'svgo';
import { mergeRight } from 'ramda';
import { base } from './base';

// 通用配置
export const generalConfig: SVGO.Options = mergeRight(base, {
  plugins: [
    ...(base.plugins || []),
    // 删除属性
    // { removeAttrs: { attrs: ['class', 'fill'] } }
  ]
});
