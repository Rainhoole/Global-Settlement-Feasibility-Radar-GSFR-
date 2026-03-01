# i18n 发布流程（离线翻译）

目标：线上用户点击 `中 / EN` 时立即切换，不在浏览器里临时请求翻译。

## 当前机制

- 运行时只读取本地字典文件：`src/locales/zh-CN.json`
- 语言切换不调用任何翻译 API
- 只有你在本地执行离线脚本时，才会调用 DeepSeek 生成/补全翻译

## 本地更新翻译

1. 在仓库根目录或 `app` 目录准备 DeepSeek 环境变量（示例见 `app/.env.example`）
2. 进入 `app` 执行：

```bash
npm run i18n:build:zh
```

3. 脚本会：
- 读取 `src/locales/source-texts.json` 与 `src/data/countries.json` 的英文文案
- 调用 DeepSeek 批量翻译缺失项
- 输出到 `src/locales/zh-CN.json`

## 发布前检查

1. 构建：

```bash
npm run build
```

2. 确认 `src/locales/zh-CN.json` 已更新并提交到 Git
3. 再执行 GitHub Pages 发布流程

## 新增文案时

如果新增了固定 UI 文案，先把英文加到 `src/locales/source-texts.json`，再运行：

```bash
npm run i18n:build:zh
```

