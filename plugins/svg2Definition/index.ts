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

// XML虚拟节点选项
export interface XML2AbstractNodeOptions extends SVG2DefinitionOptions {
  name: string;
}

// 字符串方法
export interface StringifyFn {
  (icon: AbstractNodeDefinition): string;
}

// 虚拟节点定义
export interface AbstractNodeDefinition {
  // 名称
  name: string;
  // 主题类型
  theme: ThemeType;
  // 虚拟节点
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

        pipe(
          // "defaultTo" is not the best way to deal with the type Maybe<Element>
          get<Element>(['children', 0]),
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

        pipe(objOf('icon'), assoc('name', name), assoc('theme', theme)),
        defaultTo(JSON.stringify)(stringify)
      )
    )
  );

// element 虚拟节点
function element2AbstractNode({
  name,
  theme,
  extraNodeTransformFactories
}: XML2AbstractNodeOptions) {
  return ({ name: tag, attributes, children }: Element): AbstractNode =>
    applyTo(extraNodeTransformFactories)(
      pipe(
        map((factory: TransformFactory) => factory({ name, theme })),
        reduce(
          (transformedNode, extraTransformFn) =>
            extraTransformFn(transformedNode),
          applyTo({
            tag,
            attrs: clone(attributes),
            children: applyTo(children as Element[])(
              pipe(
                filter<Element, 'array'>(where({ type: equals('element') })),
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
            unless<AbstractNode, AbstractNode>(
              where({
                children: both(Array.isArray, pipe(length, greaterThan(__, 0)))
              }),
              deleteProp('children')
            )
          )
        )
      )
    );
}
