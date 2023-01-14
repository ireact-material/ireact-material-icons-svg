import upperFirst from 'lodash.upperfirst';
import camelCase from 'lodash.camelcase';
import { pipe } from 'ramda';

import { ThemeTypeUpperCase } from '../templates/types';

// 标识符
export interface IdentifierMeta {
  name: string;
  // 主题类型
  themeSuffix?: ThemeTypeUpperCase;
}

// 获取标识符类型
export interface GetIdentifierType {
  (meta: IdentifierMeta): string;
}

// 获取标识符
export const getIdentifier: GetIdentifierType =
  // 执行从左到右的函数组合。 第一个参数可以有任何参数； 其余参数必须是一元的。
  pipe(
    ({
      name,
      // 主题类型
      themeSuffix
    }: IdentifierMeta) =>
      // 名称+主题类型
      name + (themeSuffix ? `-${themeSuffix}` : ''),
    // 驼峰命名
    camelCase,
    // 转换字符串string的首字母为大写
    upperFirst
  );
