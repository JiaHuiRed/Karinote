# 更新日志

本文件记录 Karinote 的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。

---


## [0.0.3] - 2026-06-15

### 新增

- **集成 RedPar 电子管家**：RedPar Live2D 桌宠可读取 Karinote 数据，主动分析睡眠/心情/身体趋势，关心主人状态
- **数据桥接层**：Python 桥接脚本直接读写 SQLite 数据库，无需 API 层，零侵入
- **项目结构调整**：RedPar 作为子项目纳入仓库

## [0.0.2] - 2026-06-03

### 修复

- **全中文输出**：命令提示、表格表头、统计信息统一改为中文（之前是英文）
- **帮助文字中文**：argparse 所有 help 描述改为中文
- **嵌套子命令**：`sleep stats` / `sleep show` / `mood today` / `mood stats` 改为嵌套子命令结构，交互更清晰
- **README 中文重写**：标题加 emoji，全中文描述，移除路线图
- **Git 初始化**：项目接入 Git，推送到 GitHub

## [0.0.1] - 2026-06-03

### 新增

- **睡眠记录**：支持记录总睡眠、深睡、REM、核心睡眠、清醒时间，按日期唯一存储
- **睡眠统计**：`sleep stats` 按天数汇总，输出每日明细和平均值
- **睡眠查看**：`sleep show` 查看指定日期的完整记录
- **心情记录**：`mood log` 命令自动记录时间戳，支持 emoji 和自定义标签
- **今日心情**：`mood today` 查看当天所有心情记录
- **心情统计**：`mood stats` 按天数输出心情分布
- **数据库自动建表**：首次运行自动创建 SQLite 数据库和所有表
- **数据目录**：默认 `~/.karinote/`，支持 `KARINOTE_DATA_DIR` 环境变量覆盖
