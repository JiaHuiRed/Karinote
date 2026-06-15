# 🐳 RedPar — 你的数字人桌宠伙伴

> Red + Partner = RedPar  
> 桌宠是雨琦，陪你在桌面上说说话、解解闷～

**v0.0.2** · 桌面 Live2D 角色 + 本地 LLM 聊天 + MiMo TTS 语音 · 集成 Karinote 管家

---

## ✨ 能干啥

- 🎮 **Live2D 看板娘** — 桌面上一直陪着你的小家伙，置顶不挡事
- 💬 **智能聊天** — 接入本地 Ollama 大模型，打字跟她聊，不用联网
- 🎤 **语音回复**（可选）— 有 MiMo API Key 就能开口说话，没有也照样聊
- 📌 **穿透模式** — 点一下她就变成"透明人"，不耽误你点后面的窗口
- 📊 **电子管家** — 对接 Karinote 个人数据，知道你的睡眠、心情和身体状态，会主动关心你
- 🖼️ **无边框透明** — 看着就跟融进桌面一样

## 🚀 上手

```bash
# 装依赖
npm install

# 开发模式跑起来
npm run dev

# 打包成正式版
npm run build
npm start
```

**前置条件：** 需要本地运行 [Ollama](https://ollama.com)，并拉取模型：
```bash
ollama pull qwen3-vl:8b
```

## 💡 怎么玩

1. 先确保 Ollama 在跑（`ollama serve`），模型已拉取
2. `npm run dev` 启动，雨琦出现在桌面上
3. 底部输入框打字，回车发送，她就用文字回复你啦
4. 如果有 MiMo API Key，点 🔑 设置后就能语音回复
5. 点 📌 切换穿透/交互模式，左上角 `⠿` 拖拽移动

## 🛠️ 技术栈

| 层 | 用的啥 |
|--------|--------|
| 🖥️ 桌面壳 | Electron 33 |
| 🎨 渲染 | Pixi.js 7 |
| 🧸 Live2D | pixi-live2d-display + Cubism 4 SDK |
| 💬 LLM | 本地 Ollama（OpenAI 兼容接口） |
| 🗣️ TTS | 小米 MiMo (`mimo-v2.5-tts`)，可选 |
| 📦 构建 | TypeScript + Vite |

## 🎀 示例形象

v0.0.1 先用 Live2D 官方的 **Hiyori** 酱（日式动漫少女全身）跑通流程。  
之后可以换你自己的 Live2D 模型，放 `public/models/` 下就行。

## 📁 项目结构

```
RedPar/
├── scripts/          # 工具脚本
│   └── karinote_bridge.py  # Karinote 数据桥接
├── src/
│   ├── main/          # Electron 主进程
│   └── renderer/      # 界面 + Live2D + TTS + Chat
├── public/
│   ├── cubism/        # Cubism 4 SDK Core
│   └── models/        # Live2D 模型文件
├── index.html         # Vite 入口
├── vite.config.ts     # Vite 配置
└── package.json
```

## 📄 License

MIT — 随便玩，随便改，开心就好 🐳
