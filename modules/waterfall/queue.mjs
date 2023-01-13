import waitUntil from './wait-until.mjs';

class Queue {
  // 等待列表
  pendingEntries = [];

  // 进行中
  inFlight = 0;

  // 错误
  err = null;

  constructor(worker, options = {}) {
    // 回调函数
    this.worker = worker;

    // 并发次数
    this.concurrency = options.concurrency || 1;
  }

  // push
  push = (entries) => {
    // 等待列表
    this.pendingEntries = this.pendingEntries.concat(entries);

    // 进行中
    this.process();
  };

  // 进行中
  process = () => {
    // 剩余次数
    const scheduled = this.pendingEntries.splice(0, this.concurrency - this.inFlight);

    this.inFlight += scheduled.length;

    // 等待列表
    scheduled.forEach(async (task) => {
      try {
        // 执行回调函数
        await this.worker(task);
      }
      // error
      catch (err) {
        this.err = err;
      }
      // 完成
      finally {
        this.inFlight -= 1;
      }

      // 有等待列表
      if (this.pendingEntries.length > 0) {
        this.process();
      }
    });
  };

  // 等待
  wait = (options = {}) =>
    waitUntil(
      () => {
        // console.error();
        if (this.err) {
          this.pendingEntries = [];

          throw this.err;
        }

        return {
          // 断开
          predicate: options.empty ?
            this.inFlight === 0 && this.pendingEntries.length === 0 : this.concurrency > this.pendingEntries.length,
        };
      }, {
        delay: 50,
      },
    );
}

export default Queue;
