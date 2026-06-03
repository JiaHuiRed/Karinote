# 📝 Karinote

> **私人状态记录本 — 只存本地，命令行交互，追踪睡眠、心情与身体数据。**
> 作者：Red · Karina (敏敏)

[![版本](https://img.shields.io/badge/版本-0.0.1-orange)](CHANGELOG.md)
[![Python](https://img.shields.io/badge/Python-3.11+-3776ab)](https://python.org)
[![平台](https://img.shields.io/badge/平台-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)]()
[![许可证](https://img.shields.io/badge/许可证-MIT-lightgrey)](LICENSE)

---

## ✨ 这是什么？

Karinote 是一个**纯本地**的个人状态追踪工具。所有数据存储在本地 SQLite 文件中，不上传任何内容。通过命令行记录睡眠、心情和身体数据，随时查看统计和趋势。

---

## 🧩 核心功能

- 😴 **睡眠记录**：总睡眠、深睡、REM、核心睡眠、清醒时间，带备注
- 💭 **心情追踪**：支持 emoji 标签和自定义文字，自动记录时间戳
- 💪 **身体数据**：运动时长、皮肤状态、精力评分、咖啡杯数（v0.1.0）
- 📊 **自定义追踪**：任意指标（专注度、压力值等），无需改表结构（v0.1.0）
- 📈 **统计分析**：日/周/月维度汇总，趋势表格输出
- 🔄 **周报/月报**：一键生成回顾摘要（v0.1.0）

---

## 🚀 快速开始

### 环境要求

- Python 3.11+
- 无第三方依赖（仅使用标准库）

### 安装

```bash
cd D:\AI\Karinote
pip install -e .
```

### 基本用法

```bash
# 记录睡眠
karinote sleep record --total 420 --deep 55 --note "夜班后补觉"

# 查看最近 7 天睡眠统计
karinote sleep stats --days 7

# 记录心情
karinote mood log --mood 😊 --note "代码一次跑通"

# 查看今天心情
karinote mood today

# 心情分布统计
karinote mood stats --days 7
```

---

## 📖 命令参考

### 😴 睡眠

| 命令 | 说明 | 示例 |
|------|------|------|
| `sleep record` | 记录睡眠 | `karinote sleep record --total 420 --deep 55` |
| `sleep stats` | 睡眠统计 | `karinote sleep stats --days 7` |
| `sleep show` | 查看某天 | `karinote sleep show --date 2026-06-03` |

**参数：**

| 参数 | 必填 | 说明 |
|------|------|------|
| `--date` | 否 | 日期 YYYY-MM-DD（默认今天） |
| `--total` | 是 | 总睡眠分钟 |
| `--deep` | 否 | 深睡分钟 |
| `--awake` | 否 | 清醒分钟 |
| `--rem` | 否 | REM 分钟 |
| `--core` | 否 | 核心睡眠分钟 |
| `--note` | 否 | 备注 |

### 💭 心情

| 命令 | 说明 | 示例 |
|------|------|------|
| `mood log` | 记录心情 | `karinote mood log --mood 😊 --note "开心"` |
| `mood today` | 今天心情 | `karinote mood today` |
| `mood stats` | 心情统计 | `karinote mood stats --days 7` |

### 📊 输出示例

```
$ karinote sleep stats --days 3
日期         总睡眠   深睡
--------------------------------
2026-06-01   6h0m    60m
2026-06-02   6h30m   48m
2026-06-03   7h0m    55m
--------------------------------
平均         6h30m   54.3m
```

---

## 💾 数据存储

默认数据目录：

| 平台 | 路径 |
|------|------|
| Windows | `%USERPROFILE%\.karinote\` |
| Linux/macOS | `~/.local/share/karinote/` |

可通过环境变量 `KARINOTE_DATA_DIR` 自定义。

首次运行自动创建目录和 `karinote.db` 数据库文件。

---

## 📁 项目结构

```
karinote/
├── karinote.py          # CLI 入口
├── db.py                # 数据库初始化、连接
├── config.py            # 配置文件读取、数据目录
├── utils.py             # 日期格式化、表格打印
├── commands/
│   ├── sleep.py         # 睡眠命令
│   └── mood.py          # 心情命令
├── CHANGELOG.md         # 更新日志
└── README.md            # 本文件
```

---

## 📄 许可证

MIT
