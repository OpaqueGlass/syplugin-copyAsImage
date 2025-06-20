# 复制为图片

[English](./README.md)

> 将公式、Mermaid、UML等部分类型的块复制为PNG图片的[思源笔记](https://github.com/siyuan-note/siyuan/)插件。

> 当前版本 v1.0.0 修复：含换行符的mermaid图无法正确导出的问题；

## ✨快速开始

- 从集市下载 或 1、解压Release中的`package.zip`，2、将文件夹移动到`工作空间/data/plugins/`，3、并将文件夹重命名为`syplugin-copyAsImage`;
- 开启插件；
- 点击公式、Mermaid等块的编辑按钮，在**编辑区域右上角**可以看到插件添加的功能按钮；
- 复制为PNG：在部分块编辑区，点击“复制为PNG”按钮即可；
  - 按下`Shift`的同时点击此按钮，将下载PNG图片；（在不支持复制的情况下，也是如此）
- 复制为MathML：在公式编辑区，点击“复制为MathML”即可；（可直接粘贴到Word中，但不支持PPT）

> ⭐ 如果这对你有帮助，请考虑点亮Star！

## ❓可能常见的问题

- 无法复制？
  - 如果使用docker或网络伺服，请确保使用https安全连接，否则，点击复制按钮将下载图片。
- 没有显示复制按钮？
  - 插件在移动端不生效；如果在电脑端仍有问题，请提交issue。
- 公式和思源有些不同？
  - 插件的实现路径是：$\KaTeX$→MathML→SVG，这个过程中可能带来差异；如果你有更好的方案，欢迎提交PR。

## 🙏参考&感谢

> 部分依赖项在`package.json`中列出。

| 开发者/项目                                                         | 项目描述           | 引用方式         |
|---------------------------------------------------------------------|----------------|--------------|
| [QianJianTech/LaTeXLive](https://github.com/QianJianTech/LaTeXLive) | $\LaTeX$公式编辑器；Apache-2.0 license | SVG公式另存为PNG |