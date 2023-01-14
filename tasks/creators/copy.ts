import { src, dest } from 'gulp';

export interface CopyCreatorOptions {
  from: string[];
  toDir: string;
}

// 复制文件
export const copy = ({ from, toDir }: CopyCreatorOptions) =>
  function CopyFiles() {
    return src(from).pipe(dest(toDir));
  };
