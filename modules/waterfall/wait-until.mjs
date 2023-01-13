import sleep from './sleep.mjs';

export default async function waitUntil(test, options = {}) {
  const { delay = 5e3, tries = -1 } = options;

  const { predicate, result } = await test();

  // 断开
  if (predicate) {
    return result;
  }

  // 达到尝试限制
  if (tries - 1 === 0) {
    throw new Error('tries limit reached');
  }

  // 倒计时
  await sleep(delay);

  return waitUntil(test, { ...options, tries: tries > 0 ? tries - 1 : tries });
}
