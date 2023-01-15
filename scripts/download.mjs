import fetch from 'cross-fetch';
import path from 'path';
import fse from 'fs-extra';
import yargs from 'yargs';
import {
  fileURLToPath
} from 'url';

import Queue from '../utils/waterfall/queue.mjs';
import sleep from '../utils/waterfall/sleep.mjs';
import retry from '../utils/waterfall/retry.mjs';

// 当前路径
const currentDirectory = fileURLToPath(new URL('.',
  import.meta.url));

// Icons we don't publish.
// This is just a list of new icons.
// In the future we might change what icons we want to exclude (e.g. by popularity)
// 需要过滤的图标
const ignoredIconNames = new Set([
  '123',
  '1k',
  '1k_plus',
  '1x_mobiledata',
  '10k',
  '12mp',
  '18mp',
  '10mp',
  '11mp',
  '16mp',
  '17mp',
  '15mp',
  '21mp',
  '14mp',
  '19mp',
  '24mp',
  '2k',
  '2k_plus',
  '23mp',
  '20mp',
  '21mp',
  '22mp',
  '2mp',
  '360',
  '3p',
  '30fps',
  '3g_mobiledata',
  '30fps_select',
  '3k',
  '3k_plus',
  '3mp',
  '13mp',
  '4k',
  '4g_plus_mobiledata',
  '4k_plus',
  '4mp',
  '5g',
  '5k',
  '5k_plus',
  '5mp',
  '60fps',
  '60fps_select',
  '6k_plus',
  '6k',
  '6mp',
  '8k_plus',
  '7k_plus',
  '7k',
  '7mp',
  '8k',
  '8k_plus',
  '8mp',
  '9k_plus',
  '9k',
  '9mp',
  '18_up_rating',
  '6_ft_apart',
  'add_chart', // Leads to inconsistent casing with `Addchart`
  '3d_rotation',
  '4g_mobiledata',
]);

// 主题
const themeMap = {
  baseline: '', // filled
  outline: '_outlined',
  round: '_round',
  twotone: '_two_tone',
  sharp: '_sharp',
};

// 主题文件
const themeFileMap = {
  baseline: '', // filled
  outline: '_outlined',
  round: '_rounded',
  twotone: '_two_tone',
  sharp: '_sharp',
};

// 下载icon
const downloadIcon = (icon) => {
  console.log(`downloadIcon ${icon.index}: ${icon.name}`);

  return Promise.all(
    Object.keys(themeMap).map(async (theme) => {
      // 设置对应主题图标
      const formattedTheme = themeMap[theme].split('_').join('');
      console.log('response', `https://fonts.gstatic.com/s/i/materialicons${formattedTheme}/${icon.name}/v${icon.version}/24px.svg`);

      // 下载图标
      const response = await fetch(
        `https://fonts.gstatic.com/s/i/materialicons${formattedTheme}/${icon.name}/v${icon.version}/24px.svg`,
      );


      if (response.status !== 200) {
        throw new Error(`status ${response.status}`);
      }

      const SVG = await response.text();

      // 写入文件
      await fse.writeFile(
        path.join(
          currentDirectory,
          `../material-icons/${theme}/${icon.name}.svg`,
        ),
        SVG,
      );
    }),
  );
};

async function run() {
  try {
    const argv = yargs(process.argv.slice(2))
      // 设置消息以显示要使用的命令
      .usage('Download the SVG from material.io/resources/icons')
      // 为生成的使用信息描述一个key
      .describe('start-after', 'Resume at the following index');

    Promise.all(Object.keys(themeMap).map(async (theme) => {
      await fse.emptyDir(path.join(currentDirectory, `../material-icons/${theme}`));
    }))

    // 请求谷歌
    // const response = await fetch('https://fonts.google.com/metadata/icons');

    const text = await fse.readFile('./json.txt', {
      encoding: 'utf8'
    });
    // const text = await response.text();
    const data = JSON.parse(text.replace(")]}'", ''));
    let {
      icons
    } = data;

    icons = icons.filter((icon) => !ignoredIconNames.has(icon.name));

    icons = icons.map((icon, index) => ({
      index,
      ...icon
    }));
    icons = icons.splice(argv.startAfter || 0);

    console.log(`${icons.length} icons to download`);

    // 异步队列
    const queue = new Queue(
      async (icon) => {
        // 重试
        await retry(async ({
          tries
        }) => {
          await sleep((tries - 1) * 100);
          await downloadIcon(icon);
        });
      }, {
        // 并发次数
        concurrency: 5
      },
    );

    queue.push(icons);
    await queue.wait({
      empty: true
    });

  } catch (err) {
    console.log('err', err);
    throw err;
  }
}


run();
