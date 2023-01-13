import fetch from 'cross-fetch';
import path from 'path';
import fse from 'fs-extra';
import yargs from 'yargs';
import {
  fileURLToPath
} from 'url';

import Queue from '../modules/waterfall/queue.mjs';
import sleep from '../modules/waterfall/sleep.mjs';
import retry from '../modules/waterfall/retry.mjs';

// 当前路径
const currentDirectory = fileURLToPath(new URL('.',
  import.meta.url));

// Icons we don't publish.
// This is just a list of new icons.
// In the future we might change what icons we want to exclude (e.g. by popularity)
// 需要过滤的图标
const ignoredIconNames = new Set([
  '123',
  '6_ft_apart',
  'add_chart', // Leads to inconsistent casing with `Addchart`
  'ads_click',
  'area_chart',
  'back_hand',
  'checklist_rtl',
  'checklist',
  'compost',
  'cruelty_free',
  'data_exploration',
  'disabled_visible',
  'draw',
  'drive_file_move_rtl',
  'edit_calendar',
  'edit_note',
  'emergency',
  'exposure_neg_1', // Google product
  'exposure_neg_2', // Google product
  'exposure_plus_1', // Google product
  'exposure_plus_2', // Google product
  'exposure_zero', // Google product
  'free_cancellation',
  'front_hand',
  'generating_tokens',
  'group_off',
  'horizontal_distribute', // Advanced text editor
  'hotel_class',
  'incomplete_circle',
  'motion_photos_on', // Google product
  'motion_photos_pause', // Google product
  'motion_photos_paused', // Google product
  'new_label',
  'personal_injury',
  'pin_end',
  'pin_invoke',
  'polymer', // Legacy brand
  'private_connectivity',
  'real_estate_agent',
  'recycling',
  'space_dashboard',
  'vertical_distribute', // Advanced text editor
  'water_drop',
  'waving_hand',
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
          `../material-icons/${icon.name}${themeFileMap[theme]}_24px.svg`,
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

    await fse.emptyDir(path.join(currentDirectory, '../material-icons'));
    await fse.emptyDir(path.join(currentDirectory, '../material-icons/baseline'));

    // 请求谷歌
    const response = await fetch('https://fonts.google.com/metadata/icons');

    const text = await fse.readFile('./json.txt', {  encoding: 'utf8'});
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
