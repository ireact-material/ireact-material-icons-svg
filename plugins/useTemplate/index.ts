import { createTrasformStream } from '../creator';
import template from 'lodash.template';

// 排除文件
const excludeList = ['helpers', 'types', 'index']

// 使用模版选项
export interface UseTemplatePluginOptions {
  template: string;
  mapToInterpolate: MapToInterpolate;
}

// 映射到插值
export interface MapToInterpolate {
  (meta: { name: string; content: string; path: string }): object;
}


// 使用模版
export const useTemplate = ({
  template: tplContent,
  mapToInterpolate
}: UseTemplatePluginOptions) => {
  // 创建一个预编译模板方法
  const executor = template(tplContent);

  // 创建转换流
  return createTrasformStream((content, { stem: name, path }) => {
    const findIndex = excludeList.findIndex((exclude) => exclude === name)
    if(findIndex > -1) {
      return ''
    }

    // 吧值映射到模版
    return executor(mapToInterpolate({ name, content, path }));
  });
};
