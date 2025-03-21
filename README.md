# CopyAsIMG 

[中文](./README_zh_CN.md)

> A [siyuan-note](https://github.com/siyuan-note/siyuan/) plugin that copy formulas, Mermaid, UML, and other types of blocks as PNG images (or download SVG File).

## ✨Quick Start

- Download from the marketplace or 1. unzip `package.zip` from Releases, 2. move the folder to `workspace/data/plugins/`, 3. rename the folder to `syplugin-copyAsImage`;
- Enable the plugin;
- Click on a formula, Mermaid block, etc., and you can see the function button added by the plugin at the top right corner of the edit area;
- Copy as PNG: In some block editing areas, click the "Copy as PNG" button;
  - While pressing `Shift`, click this button to download the PNG image; (also in cases where copying is not supported)
- Copy as MathML: In the formula editing area, click "Copy as MathML"; (can be directly pasted into Word, but not supported in PPT)

> ⭐ If this project helps you, please give it a star! 

## ❓FAQs

- Cannot copy?
  - If using docker or web server, ensure a secure HTTPS connection is used; otherwise, clicking the copy button will download the image.
- No copy button displayed?
  - The plugin does not work on mobile devices; if there are still issues on desktop, please submit an issue.
- Formulas look different from what's expected in SiYuan?
  - The plugin's implementation path is: $\KaTeX$→MathML→SVG, which may lead to differences during this process; if you have a better solution, PRs are welcome.

## 🙏Acknowledgments & Thanks

> Some dependencies are listed in `package.json`.

| Developer/Project                                                         | Description           | Usage         |
|---------------------------------------------------------------------|----------------|--------------|
| [QianJianTech/LaTeXLive](https://github.com/QianJianTech/LaTeXLive) | $\LaTeX$ formula editor; Apache-2.0 license | Save SVG formula as PNG |