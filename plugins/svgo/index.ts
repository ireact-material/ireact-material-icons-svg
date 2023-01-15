import SVGO from 'svgo';
import { createTrasformStreamAsync } from '../creator';

// svgo
export const svgo = (options: SVGO.Options) => {
  const optimizer = new SVGO(options);

  // 创建转换流异步
  return createTrasformStreamAsync(async (before) => {
    const { data } = await optimizer.optimize(before);

    return data;
  });
};
