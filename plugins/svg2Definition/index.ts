import {
  pipe,
  clone,
  map,
  filter,
  where,
  equals,
  gt as greaterThan,
  both,
  unless,
  length,
  dissoc as deleteProp,
  reduce,
  path as get,
  __,
  applyTo,
  defaultTo,
  objOf,
  assoc
} from 'ramda';
// 兼容的xml
import parseXML, { Element } from '@rgrove/parse-xml';

import { createTrasformStream } from '../creator';
import { ThemeType, AbstractNode } from '../../templates/types';

// SVG定义选项
export interface SVG2DefinitionOptions {
  // 主题
  theme: ThemeType;
  // 额外的节点转换
  extraNodeTransformFactories: TransformFactory[];
  // 字符串转换方法
  stringify?: StringifyFn;
}

// 转换方法
export interface TransformFactory {
  (options: TransformOptions): (asn: AbstractNode) => AbstractNode;
}

// 转换选项
export type TransformOptions = Pick<XML2AbstractNodeOptions, 'name' | 'theme'>;

// XML抽象节点选项
export interface XML2AbstractNodeOptions extends SVG2DefinitionOptions {
  name: string;
}

// 字符串方法
export interface StringifyFn {
  (icon: AbstractNodeDefinition): string;
}

// 抽象节点定义
export interface AbstractNodeDefinition {
  // 名称
  name: string;
  // 主题类型
  theme: ThemeType;
  // 抽象节点
  icon: AbstractNode;
}

// SVG => IconDefinition
export const svg2Definition = ({
  theme,
  extraNodeTransformFactories,
  stringify
}: SVG2DefinitionOptions) =>
  // 创建转换流
  createTrasformStream((SVGString, { stem: name }) =>
    // 获取一个值并对其应用一个函数
    applyTo(SVGString)(
      // 执行从左到右的函数组合
      pipe(
        // 0. SVG 字符串是这样的：
        // <svg viewBox="0 0 1024 1024"><path d="..."/></svg>

        parseXML,

        // 1、解析出的XML根节点为JSON格式：
        // {
        //   "type": "document",
        //   "children": [
        //     {
        //       "type": "element",
        //       "name": "svg",
        //       "attributes": { "viewBox": "0 0 1024 1024" },
        //       "children": [
        //         {
        //           "type": "element",
        //           "name": "path",
        //           "attributes": {
        //             "d": "..."
        //           },
        //           "children": []
        //         }
        //       ]
        //     }
        //   ]
        // }

        // 执行从左到右的函数组合
        pipe(
          // 检索给定路径的值
          get<Element>(['children', 0]),
          // 如果第二个参数不为 null、undefined 或 NaN，则返回第二个参数； 否则返回第一个参数
          defaultTo({} as any as Element)
        ),

        // 2. 元素节点具有 JSON 形状：
        // {
        //   "type": "element",
        //   "name": "svg",
        //   "attributes": { "viewBox": "0 0 1024 1024" },
        //   "children": [
        //     {
        //       "type": "element",
        //       "name": "path",
        //       "attributes": {
        //         "d": "..."
        //       },
        //       "children": []
        //     }
        //   ]
        // }

        // 元素抽象节点
        element2AbstractNode({
          name,
          theme,
          extraNodeTransformFactories
        }),

        // 3. 抽象节点具有 JSON 形状：
        // {
        //   "tag": "svg",
        //   "attrs": { "viewBox": "0 0 1024 1024", "focusable": "false" },
        //   "children": [
        //     {
        //       "tag": "path",
        //       "attrs": {
        //         "d": "..."
        //       }
        //     }
        //   ]
        // }

        // 合并对象
        pipe(objOf('icon'), assoc('name', name), assoc('theme', theme)),

        // 如果第二个参数不为 null、undefined 或 NaN，则返回第二个参数； 否则返回第一个参数。
        defaultTo(JSON.stringify)(stringify)
      )
    )
  );

// element 抽象节点
function element2AbstractNode({
  // 名称
  name,
  // 主题
  theme,
  // 额外的节点转换
  extraNodeTransformFactories
}: XML2AbstractNodeOptions) {
  return ({ name: tag, attributes, children }: Element): AbstractNode =>
    // 获取一个值并对其应用一个函数
    applyTo(extraNodeTransformFactories)(
      pipe(
        // 接受一个函数和一个函子，将函数应用于每个函子的值，并返回一个相同形状的函子
        map((factory: TransformFactory) => factory({ name, theme })),
        // 通过遍历列表返回单个项目，
        // 依次调用迭代器函数并将累加器值和数组中的当前值传递给它，
        // 然后将结果传递给下一个调用
        reduce(
          (transformedNode, extraTransformFn) => {
            // transformedNode 以下输出
            // {
            //   tag: 'svg',
            //   attrs: { viewBox: '0 0 24 24', focusable: 'false' },
            //   children: [
            //     { tag: 'path', attrs: [Object] },
            //     { tag: 'path', attrs: [Object] }
            //   ]
            // }
            return extraTransformFn(transformedNode);
          },
          // 获取一个值并对其应用一个函数
          applyTo({
            // 节点
            tag,
            // 属性
            attrs: clone(attributes),
            // 子节点
            children: applyTo(children as Element[])(
              pipe(
                // 过滤
                filter<Element, 'array'>(where({ type: equals('element') })),
                // 接受一个函数和一个函子，将函数应用于每个函子的值，并返回一个相同形状的函子
                map(
                  element2AbstractNode({
                    name,
                    theme,
                    extraNodeTransformFactories
                  })
                )
              )
            )
          })(
            // 通过将最终参数传递给给定的谓词函数来测试它
            unless<AbstractNode, AbstractNode>(
              where({
                children: both(Array.isArray, pipe(length, greaterThan(__, 0)))
              }),
              // 返回一个不包含 prop 属性的新对象。
              deleteProp('children')
            )
          )
        )
      )
    );
}
