// 工具库
import {
  evolve,
  clone,
  pipe,
  mergeLeft,
  when,
  equals,
  where,
  mergeRight
} from 'ramda';

// 转换方法 | 转换选项
import { TransformFactory, TransformOptions } from '..';
// 抽象节点
import { AbstractNode } from '../../../templates/types';

type Dictionary = Record<string, string>;

// 是一个帮助对节点添加额外属性的辅助函数
// 对所有类型为 `svg` 的节点（即 `svg` 标签），赋值添加 `focusable="false"` 属性
export function assignAttrsAtTag(
  // 目标节点
  tag: string,
  // 配置
  extraPropsOrFn:
    | Dictionary
    | ((
        // 转换选项
        options: TransformOptions & { previousAttrs: Dictionary }
      ) => Dictionary)
): TransformFactory {
  return (options) => (asn) =>
    // 通过将最终参数传递给给定的谓词函数来测试它
    when<AbstractNode, AbstractNode>(
      where({
        // 如果其参数相等则返回 true，否则返回 false。 处理循环数据结构
        tag: equals(tag)
      }),
      // 通过递归演化对象的浅表副本来创建新对象
      evolve({
        // 执行从左到右的函数组合
        attrs: pipe<Dictionary, Dictionary, Dictionary>(
          // 创建源的深层副本，可用于代替源对象而不保留对它的任何引用
          clone,
          // 创建一个新对象，将第一个对象的自身属性与第二个对象的自身属性合并
          // 如果两个对象中都存在键，则将使用第一个对象的值
          mergeLeft(
            typeof extraPropsOrFn === 'function'
              ? extraPropsOrFn(
                  // 创建一个新对象，将第一个对象的自身属性与第二个对象的自身属性合并
                  // 如果两个对象中都存在键，则将使用第二个对象的值
                  mergeRight(options, { previousAttrs: asn.attrs })
                )
              : extraPropsOrFn
          )
        )
      })
    )(asn);
}
