# 更新日志

本文件记录 Karinote 的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。

---

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
