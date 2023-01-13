import fse from 'fs-extra';
import globAsync from 'fast-glob';
import path from 'path';
import yargs from 'yargs';
import {
  fileURLToPath
} from 'url';
import rimraf from 'rimraf';
import intersection from 'lodash/intersection.js';
import * as svgo from 'svgo';
import Mustache from 'mustache';

import Queue from '../../modules/waterfall/queue.mjs';

// 当前目录
const currentDirectory = fileURLToPath(new URL('.',
  import.meta.url));

export const RENAME_FILTER_DEFAULT = './renameFilters/default.mjs';
export const RENAME_FILTER_MUI = './renameFilters/material-design-icons.mjs';

/**
 * 将目录分隔符转换为斜杠，因此路径可以在 fast-glob 中使用
 * @param {string} pathToNormalize
 * @returns
 */
function normalizePath(pathToNormalize) {
  return pathToNormalize.replace(/\\/g, '/');
}

/**
 * Return Pascal-Cased component name.
 * @param {string} destPath
 * @returns {string} class name
 */
export function getComponentName(destPath) {
  const splitregex = new RegExp(`[\\${path.sep}-]+`);

  const parts = destPath
    .replace('.js', '')
    .split(splitregex)
    .map((part) => part.charAt(0).toUpperCase() + part.substring(1));

  return parts.join('');
}

// 生成索引
async function generateIndex(options) {
  // 将目录分隔符转换为斜杠，因此路径可以在
  const files = await globAsync(normalizePath(path.join(options.outputDir, '*.js')));

  const index = files
    .map((file) => {
      const typename = path.basename(file).replace('.js', '');
      return `export { default as ${typename} } from './${typename}';\n`;
    })
    .sort()
    .join('');

  await fse.writeFile(path.join(options.outputDir, 'index.js'), index);
}

// Noise introduced by Google by mistake
const noises = [
  ['="M0 0h24v24H0V0zm0 0h24v24H0V0z', '="'],
  ['="M0 0h24v24H0zm0 0h24v24H0zm0 0h24v24H0z', '="'],
];

// 去除噪音
function removeNoise(input, prevInput = null) {
  if (input === prevInput) {
    return input;
  }

  let output = input;

  noises.forEach(([search, replace]) => {
    if (output.indexOf(search) !== -1) {
      output = output.replace(search, replace);
    }
  });

  return removeNoise(output, input);
}

// 清除路径
export function cleanPaths({
  svgPath,
  data
}) {
  // 在优化之前删除硬编码的颜色填充，以便删除空组
  const input = data
    .replace(/ fill="#010101"/g, '')
    .replace(/<rect fill="none" width="24" height="24"\/>/g, '')
    .replace(/<rect id="SVGID_1_" width="24" height="24"\/>/g, '');

  // 优化 SVG 矢量图形文件
  const result = svgo.optimize(input, {
    // 浮动精度
    floatPrecision: 4,
    // 多线程
    multipass: true,
    plugins: [{
        name: 'cleanupAttrs'
      },
      {
        name: 'removeDoctype'
      },
      {
        name: 'removeXMLProcInst'
      },
      {
        name: 'removeComments'
      },
      {
        name: 'removeMetadata'
      },
      {
        name: 'removeTitle'
      },
      {
        name: 'removeDesc'
      },
      {
        name: 'removeUselessDefs'
      },
      {
        name: 'removeEditorsNSData'
      },
      {
        name: 'removeEmptyAttrs'
      },
      {
        name: 'removeHiddenElems'
      },
      {
        name: 'removeEmptyText'
      },
      {
        name: 'removeViewBox'
      },
      {
        name: 'cleanupEnableBackground'
      },
      {
        name: 'minifyStyles'
      },
      {
        name: 'convertStyleToAttrs'
      },
      {
        name: 'convertColors'
      },
      {
        name: 'convertPathData'
      },
      {
        name: 'convertTransform'
      },
      {
        name: 'removeUnknownsAndDefaults'
      },
      {
        name: 'removeNonInheritableGroupAttrs'
      },
      {
        name: 'removeUselessStrokeAndFill',
        params: {
          // https://github.com/svg/svgo/issues/727#issuecomment-303115276
          removeNone: true,
        },
      },
      {
        name: 'removeUnusedNS'
      },
      {
        name: 'cleanupIDs'
      },
      {
        name: 'cleanupNumericValues'
      },
      {
        name: 'cleanupListOfValues'
      },
      {
        name: 'moveElemsAttrsToGroup'
      },
      {
        name: 'moveGroupAttrsToElems'
      },
      {
        name: 'collapseGroups'
      },
      {
        name: 'removeRasterImages'
      },
      {
        name: 'mergePaths'
      },
      {
        name: 'convertShapeToPath'
      },
      {
        name: 'sortAttrs'
      },
      {
        name: 'removeDimensions'
      },
      {
        name: 'removeElementsByAttr'
      },
      {
        name: 'removeStyleElement'
      },
      {
        name: 'removeScriptElement'
      },
      {
        name: 'removeEmptyContainers'
      },
    ],
  });


  // 多个子节点
  let childrenAsArray = false;
  const jsxResult = svgo.optimize(result.data, {
    plugins: [{
      name: 'svgAsReactFragment',
      type: 'visitor',
      fn: () => ({
        root: {
          enter(root) {

            const [svg, ...rootChildren] = root.children;
            // 没有根节点
            if (rootChildren.length > 0) {
              throw new Error('Expected a single child of the root');
            }

            // 期望一个 svg 元素作为根子元素
            if (svg.type !== 'element' || svg.name !== 'svg') {
              throw new Error('Expected an svg element as the root child');
            }

            // 有子节点
            if (svg.children.length > 1) {
              childrenAsArray = true;

              svg.children.forEach((svgChild, index) => {
                svgChild.addAttr({
                  name: 'key',
                  value: index
                });

                // Original name will be restored later
                // We just need a mechanism to convert the resulting
                // svg string into an array of JSX elements
                svgChild.renameElem(`SVGChild:${svgChild.name}`);
              });
            }

            root.spliceContent(0, svg.children.length, svg.children);
          },
        },
      }),
    }],
  });

  // 从 svg 字符串中提取路径
  // 清理 xml 路径
  // 实现为 svgo 插件
  let paths = jsxResult.data
    .replace(/"\/>/g, '" />')
    .replace(/fill-opacity=/g, 'fillOpacity=')
    .replace(/xlink:href=/g, 'xlinkHref=')
    .replace(/clip-rule=/g, 'clipRule=')
    .replace(/fill-rule=/g, 'fillRule=')
    // Fix visibility issue and save some bytes.
    .replace(/ clip-path=".+?"/g, '')
    // 删除未使用的定义
    .replace(/<clipPath.+?<\/clipPath>/g, '');

  // 有大小
  const sizeMatch = svgPath.match(/^.*_(\d+)px.svg$/);
  const size = sizeMatch ? Number(sizeMatch[1]) : null;

  // 设置大小
  if (size !== 24) {
    // 最多保留2位小数
    const scale = Math.round((24 / size) * 100) / 100;
    paths = paths.replace('clipPath="url(#b)" ', '');
    paths = paths.replace(/<path /g, `<path transform="scale(${scale}, ${scale})" `);
  }

  paths = removeNoise(paths);

  if (childrenAsArray) {
    const pathsCommaSeparated = paths
      // 处理自闭标签
      .replace(/key="\d+" \/>/g, '$&,')
      // 处理剩下的
      .replace(/<\/SVGChild:(\w+)>/g, '</$1>,');

    paths = `[${pathsCommaSeparated}]`;
  }

  // 设置路径
  paths = paths.replace(/SVGChild:/g, '');

  return paths;
}

// 工作队列
async function worker({
  progress,
  svgPath,
  options,
  renameFilter,
  template
}) {
  progress();

  // 规范化 Svg 路径
  const normalizedSvgPath = path.normalize(svgPath);
  const svgPathObj = path.parse(normalizedSvgPath);
  // 相对目录
  const innerPath = path
    // 目录名
    .dirname(normalizedSvgPath)
    .replace(options.svgDir, '')
    .replace(path.relative(process.cwd(), options.svgDir), '');

  // 目标路径
  const destPath = renameFilter(svgPathObj, innerPath, options);

  const outputFileDir = path.dirname(path.join(options.outputDir, destPath));

  // 确保目录存在。如果目录结构不存在，则创建它F
  await fse.ensureDir(outputFileDir);

  // 读取文件
  const data = await fse.readFile(svgPath, {
    encoding: 'utf8'
  });

  // 清理svg路径
  const paths = cleanPaths({
    svgPath,
    data
  });

  // 设置组件名称为驼峰
  const componentName = getComponentName(destPath);

  // 模版
  const fileString = Mustache.render(template, {
    paths,
    componentName,
  });

  // 绝对目录
  const absDestPath = path.join(options.outputDir, destPath);

  // 写入文件
  await fse.writeFile(absDestPath, fileString);
}

const handler = async (options) => {
  const progress = options.disableLog ? () => {} : () => process.stdout.write('.');

  // Clean old files
  rimraf.sync(`${options.outputDir}/*.js`);

  // 重新命名文件
  let {
    renameFilter
  } = options;
  if (typeof renameFilter === 'string') {
    const renameFilterModule = await import(renameFilter);
    renameFilter = renameFilterModule.default;
  }

  // error
  if (typeof renameFilter !== 'function') {
    throw Error('renameFilter must be a function');
  }

  // 确保目录存在。如果目录结构不存在，则创建它 -> src
  await fse.ensureDir(options.outputDir);

  const [svgPaths, template] = await Promise.all([
    // 遍历文件
    globAsync(normalizePath(path.join(options.svgDir, options.glob))),
    fse.readFile(path.join(currentDirectory, 'templateSvgIcon.js'), {
      encoding: 'utf8',
    }),
  ]);

  // 队列
  const queue = new Queue(
    (svgPath) =>
    worker({
      progress,
      svgPath,
      options,
      renameFilter,
      template,
    }), {
      concurrency: 8
    },
  );

  queue.push(svgPaths);
  await queue.wait({
    empty: true
  });

  // 遍历文件
  // let legacyFiles = await globAsync(normalizePath(path.join(currentDirectory, '/legacy', '*.js')));
  // legacyFiles = legacyFiles.map((file) => path.basename(file));

  // 生成文件
   await globAsync(normalizePath(path.join(options.outputDir, '*.js')));
  // generatedFiles = generatedFiles.map((file) => path.basename(file));

  // 获取一个或多个数组的交集
  // const duplicatedIconsLegacy = intersection(generatedFiles);
  // if (duplicatedIconsLegacy.length > 0) {
  //   throw new Error(
  //     `Duplicated icons in legacy folder. Either \n` +
  //     `1. Remove these from the /legacy folder\n` +
  //     `2. Add them to the blacklist to keep the legacy version\n` +
  //     `The following icons are duplicated: \n${duplicatedIconsLegacy.join('\n')}`,
  //   );
  // }

  // await fse.copy(path.join(currentDirectory, '/legacy'), options.outputDir);
  // await fse.copy(path.join(currentDirectory, '/custom'), options.outputDir);

  await generateIndex(options);
};


yargs(process.argv.slice(2))
  .command({
    command: '$0>',
    // 从 SVG 构建 JSX 组件
    description: "Build JSX components from SVG's.",
    handler,
    builder: (command) => {
      command
        .option('output-dir', {
          required: true,
          type: 'string',
          describe: 'Directory to output jsx components',
        })
        .option('svg-dir', {
          required: true,
          type: 'string',
          describe: 'Directory to output jsx components',
        })
        .option('glob', {
          type: 'string',
          describe: 'Glob to match inside of --svg-dir',
          default: '**/*.svg',
        })
        .option('inner-path', {
          type: 'string',
          describe: '"Reach into" subdirs, since libraries like material-design-icons' +
            ' use arbitrary build directories to organize icons' +
            ' e.g. "action/svg/production/icon_3d_rotation_24px.svg"',
          default: '',
        })
        .option('file-suffix', {
          type: 'string',
          describe: 'Filter only files ending with a suffix (pretty much only for @mui/icons-material)',
        })
        .option('rename-filter', {
          type: 'string',
          describe: 'Path to JS module used to rename destination filename and path.',
          default: RENAME_FILTER_DEFAULT,
        })
        .option('disable-log', {
          type: 'boolean',
          describe: 'If true, does not produce any output in STDOUT.',
          default: false,
        });
    },
  })
  // 显示用法字符串并退出进程
  .help()
  // 任何不需要的或没有相应描述的命令行参数都将被报告为错误
  .strict(true)
  // 显示版本号
  .version(false)
  // 解析
  .parse();
