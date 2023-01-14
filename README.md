## 目录结构

```bash
.
├── babel.config.cjs      # 用于测试环境的 babel 配置
├── es                    # tsc 输出目录，使用 ES Modules
├── gulpfile.ts           # 用于整个图标生成的 gulp 配置文件
├── inline-svg            # gulp 输出目录，输出可直接使用的 SVG
├── inline-namespaced-svg # gulp 输出目录，输出可直接使用的 SVG
├── jest.config.cjs
├── lib                   # tsc 输出目录，使用 CommonJS
├── package.json
├── plugins               # gulp 的插件目录，存放用于处理图标的自定义 gulp 插件
├── scripts               # 其他自定义的脚本文件
├── src                   # 源文件目录，该目录下的文件通常由 gulp 生成，然后通过 tsc 编译输出到 es、lib 目录
├── svg                   # 存放从设计师得到的，未经处理的图标文件
├── tasks/creators        # gulp 的任务工厂函数目录，存放用于处理图标的自定义 gulp 任务工厂函数
├── templates             # 模板目录
├── test
├── tsconfig.build.json   # 用于编译构建（build）的 TypeScript 配置
├── tsconfig.json         # 用于生成（generate）的（gulp 运行环境） TypeScript 配置
├── typings.d.ts
└── utils
```
