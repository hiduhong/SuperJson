# SuperJson - 专为开发者打造的智能 JSON 解析神器

<p align="center">
  <img src="public/favicon.svg" width="100" height="100" alt="SuperJson Logo">
</p>

<p align="center">
  <a href="https://react.dev/">
    <img src="https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react" alt="React">
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript" alt="TypeScript">
  </a>
  <a href="https://vitejs.dev/">
    <img src="https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite" alt="Vite">
  </a>
  <a href="https://tailwindcss.com/">
    <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS">
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT">
  </a>
</p>

<p align="center">
  <strong>智能提取</strong> · <strong>深度解析</strong> · <strong>格式化</strong> · <strong>可视化</strong>
</p>

---

## 📖 简介 | Introduction

**SuperJson** 是一款专为开发者设计的 JSON 处理工具。它不仅是一个格式化器，更是一个能够从混乱的日志、报错信息或混合文本中**智能提取**有效 JSON 的神器。无论你的 JSON 被转义了多少次，或者隐藏在多深的结构中，SuperJson 都能帮你一键还原。

## ✨ 核心特性 | Features

### 1. 智能提取 (Smart Extract)
自动识别并提取混合在普通文本、日志行中的 JSON 对象，支持对象与数组等多种结构。

### 2. 深度反转义 (Deep Unescape)
自动处理多层嵌套的转义字符串（例如：`"{\"a\": \"{\\\"b\\\": 1}\"}"`），递归解析直到还原最原始的数据结构。

### 3. 多对象支持 (Multi-Object Support)
智能识别单行文本中的多个独立 JSON 对象，并在查看器中以分割线形式清晰展示多个结果。

### 4. 现代化 UI (Modern UI)
基于 React + TailwindCSS 的现代化界面，采用翡翠绿（Emerald）主题，支持语法高亮、折叠/展开、复制等能力。

## 🚀 快速开始 | Quick Start

### 1. 环境要求

1) 安装 Node.js (>= 16)
2) 准备包管理器（npm / yarn / pnpm）

### 2. 安装与运行

```bash
# 克隆项目
git clone https://github.com/your-username/SuperJson.git

# 进入目录
cd SuperJson

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开浏览器访问 `http://localhost:5173` 即可使用。

## 🛠️ 技术栈 | Tech Stack

1) 前端框架： [React](https://react.dev/)
2) 语言： [TypeScript](https://www.typescriptlang.org/)
3) 构建工具： [Vite](https://vitejs.dev/)
4) 样式： [Tailwind CSS](https://tailwindcss.com/)
5) 图标： [Lucide React](https://lucide.dev/)
6) JSON 查看器： [react-json-view](https://github.com/mac-s-g/react-json-view)
7) 分割布局： [react-split](https://github.com/nathancahill/react-split)

## 🤝 贡献 | Contribution

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📄 许可证 | License

本项目采用 [MIT License](LICENSE) 许可证。
