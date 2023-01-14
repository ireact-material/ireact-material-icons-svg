import del from 'del';

// 删除文件和目录
export const clean = (dirs: string[]) =>
  function CleanDirectories() {
    return del(dirs);
  };
