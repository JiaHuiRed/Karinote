# Changelog
## [0.0.3] - 2026-06-22

### 新增

- **完整动画系统**：移植 AIRI stage-ui-live2d 动画核心，新增 `animation/` 模块（`blink.ts` 自动眨眼 3-8s、`eye-focus.ts` 视线跟随鼠标 + 空闲漂移、`beat-sync.ts` 头随节奏动、`lip-sync.ts` TTS 口型同步、`expression.ts` Live2D 表情、`motion-manager.ts` 插件架构）
- **Hiyori 模型集成**：从 Live2D 官方 CubismWebSamples 下载完整 Hiyori 模型（moc3 + 2048 纹理 + 10 个 motion + 物理/表情），放 `public/models/hiyori/`
- **Electron Node v24 兼容补丁**：`scripts/electron-patch.js` monkey-patch `util._extend`，解决 Electron 33 CLI 在 Node v24 下崩溃问题

### 修复

- `live2d.ts` 从 91 行 stub 升级为 264 行完整控制器，Spring 物理驱动头部角度（stiffness=120, damping=16）
- `app.ts` 新增 `mousemove` 追踪雨琦视线 + TTS `startTalking/stopTalking` 钩子驱动口型

### 变更

- 动画模块全部用纯 TS class 实现，零 Vue/Pinia/Three.js 依赖，可直接复用


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
