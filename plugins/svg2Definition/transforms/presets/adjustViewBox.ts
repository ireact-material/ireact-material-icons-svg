import { includes } from 'ramda';

// 分配属性标签
import { assignAttrsAtTag } from '..';
// 转换方法
import { TransformFactory } from '../..';

const OLD_ICON_NAMES = [
  'step-backward',
  'step-forward',
  'fast-backward',
  'fast-forward',
  'forward',
  'backward',
  'caret-up',
  'caret-down',
  'caret-left',
  'caret-right',
  'retweet',
  'swap-left',
  'swap-right',
  'loading',
  'loading-3-quarters',
  'coffee',
  'bars',
  'file-jpg',
  'inbox',
  'shopping-cart',
  'safety',
  'medium-workmark'
];

// 调整ViewBox
export const adjustViewBox: TransformFactory = assignAttrsAtTag(
  'svg',
  ({ name }) => ({
    // includes 判断 name 是否在 OLD_ICON_NAMES 中
    viewBox: includes(name, OLD_ICON_NAMES) ? '0 0 1024 1024' : '64 64 896 896'
  })
);
