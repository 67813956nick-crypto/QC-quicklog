# QC-quicklog 材料质量证明文件快速录入

石化项目材料质量证明文件（质保书/合格证）快速录入工具。上传 MinerU 解析的 JSON 文件，自动解析阀门、对焊法兰、管材、紧固件、垫片、管件等物资信息，补填自编号后一键导出底表与 SH/T 3503—J132 一览表。

## 使用

1. 用浏览器打开 `材料录入桥接工具_v7.3.html`
2. 上传 MinerU 解析出的 JSON 文件（见 `tests/fixtures/` 样例格式）
3. 解析结果自动填入底表，可手动补填「证件自编号」「复验报告编号」
4. 导出：底表 CSV / 一览表 CSV / JSON

> 单 HTML 文件，无需安装依赖，双击即用。

## 目录结构

```
QC-quicklog/
├── 材料录入桥接工具_v7.3.html   # 主应用（当前版本）
├── test_v72_json.js             # 回归测试脚本（Node + jsdom）
├── rules/                       # 解析器需求规则（xlsx）
├── tests/fixtures/              # 22 个测试用例 JSON（序号1-22）
└── templates/                   # 输出模板（底表 / 一览表）
```

## 回归测试

```bash
npm install jsdom   # 首次
node test_v72_json.js
```

预期：22 个测试用例中 13 通过 / 9 偏差（OCR 数据问题，暂不处理）/ 0 缺失。

## 版本

- 当前：**V7.3**（2026-08-26，新增序号22对焊法兰）
- 版本历史见 `CHANGELOG.md`

## 分支约定

- `main`：稳定版，合并后更新 CHANGELOG 并打 tag（v7.3 / v7.4 ...）
- `feat/*`：新功能/新序号开发分支

## 更新流程（换电脑可用）

```bash
git pull                          # 获取最新版本
# 开发新功能后
git add -A
git commit -m "feat: 新增序号xx解析"
git push
```
