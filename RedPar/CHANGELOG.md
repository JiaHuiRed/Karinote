# Changelog
## [0.0.2] - 2026-06-15

### Added

- **Karinote 数据桥接**：Python 桥接脚本 `karinote_bridge.py`，支持 query/write 四种数据类型（sleep/mood/body/track）
- **电子管家身份**：TTS 系统提示注入主人状态数据，Live2D 角色能主动分析关心用户
- **IPC 通信层**：主进程 karinote:query/karinote:write handler + preload API 暴露给渲染层
- **数据上下文模块**：`karinote.ts` 自动拉取 7 天数据，格式化后注入 LLM 聊天上下文


## [0.0.1] - 2026-06-07

### Fixed
- Live2D 模型加载失败（`pixi-live2d-display` 主模块强制检查 Cubism 2 运行时 → 改从 `cubism4` 子路径导入）
- 模型显示不全（动态缩放至窗口 82% 高度，居中显示全身）

### Changed
- 聊天改接本地 Ollama（`qwen3-vl:8b`），不再需要 API Key 即可聊天
- MiMo TTS 改为可选（有 Key 才启用语音，没 Key 只显示文字）
- 关闭 DevTools 自动弹出

## [0.0.1] - 2026-06-06

### Added
- 项目初始化，RedPar 数字人桌宠原型
- Electron 桌面 overlay 窗口（置顶、透明、穿透模式）
- Live2D 模型渲染（pixi.js + pixi-live2d-display）
- 小米 MiMo TTS 语音合成接入
- 聊天输入交互（文字→TTS→语音播放）
- MIT License
