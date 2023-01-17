// 围绕 Node.js streams.Transform (Streams2/3) 的微型包装器，以避免显式子类化噪音
import through from 'through2';
// 虚拟文件格式
import File from 'vinyl';

// 创建转换流
export const createTrasformStream = (fn: (raw: string, file: File) => string) =>
  through.obj((file: File, encoding, done) => {
    // 对象是 Buffer
    if (file.isBuffer()) {
      // 转换编码
      const before = file.contents.toString(encoding);

      try {
        const after = fn(before, file);

        // 有返回文件
        if (after) {
          file.contents = Buffer.from(after);
          done(null, file);
        }
        // 跳过文件
        else {
          done(null);
        }

        // done(null, file);
      } catch (err) {
        done(err, null);
      }
    }
    // 其他
    else {
      done(null, file);
    }
  });

// 创建转换流异步
export const createTrasformStreamAsync = (
  fn: (raw: string, file: File) => Promise<string>
) =>
  through.obj((file: File, encoding, done) => {
    // 有isBuffer
    if (file.isBuffer()) {
      // 转换编码
      const before = file.contents.toString(encoding);

      // 异步方法
      fn(before, file)
        .then((after) => {
          file.contents = Buffer.from(after);
          done(null, file);
        })
        .catch((err) => {
          done(err, null);
        });
    }
    // 其他
    else {
      done(null, file);
    }
  });
