# 📝 Karinote

> **Personal Status Journal + Digital Butler Pet — Local-only, CLI-driven, tracking sleep, mood, and body metrics. Yuqi keeps you company on your desktop.**
> Author: Red · Karina (Minyeon)

[![Version](https://img.shields.io/badge/version-0.0.5-orange)](CHANGELOG.md)
[![Python](https://img.shields.io/badge/Python-3.11+-3776ab)](https://python.org)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)]()
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](LICENSE)

---

## ✨ What is this?

Karinote is a **fully local** personal status tracker. All data is stored in a local SQLite file — nothing is uploaded. Use the command line to log sleep, mood, and body metrics, and view statistics and trends anytime.

Also comes with **RedPar Digital Butler Pet** — a Live2D desktop companion (Yuqi) that reads your Karinote data, proactively checks in on your sleep, mood, and body status, and chats with you to keep you company.

---

## 🧩 Core Features

### 📝 Karinote — Personal Status Journal

- 😴 **Sleep Tracking**: Total sleep, deep sleep, REM, core sleep, awake time, with notes
- 💭 **Mood Tracking**: Emoji tags and custom text, timestamps recorded automatically
- 💪 **Body Metrics**: Exercise duration, skin condition, energy score, coffee cups (v0.1.0)
- 📊 **Custom Tracking**: Any metric (focus, stress, etc.) without schema changes (v0.1.0)
- 📈 **Statistics**: Daily / weekly / monthly summaries, trend tables
- 🔄 **Weekly / Monthly Reports**: One-click review summaries (v0.1.0)

### 🐳 RedPar — Digital Butler Pet

- 🎮 **Live2D Companion** — Yuqi stays on your desktop, always on top without blocking work
- 💬 **Smart Chat** — Powered by local Ollama LLM, chat offline without internet
- 🎤 **Voice Reply** (optional) — Speaks aloud with MiMo API Key, works without it too
- 📌 **Click-through Mode** — Turns transparent on click, doesn't block window interactions
- 📊 **Karinote Integration** — Reads your sleep, mood, and body data to check in on you
- 🖼️ **Frameless Transparent** — Blends right into your desktop

---

## 🚀 Quick Start

### Requirements

- Python 3.11+
- No third-party dependencies (standard library only)

### Installation

```bash
git clone https://github.com/yourusername/karinote.git
cd karinote
pip install -e .
```

### Basic Usage

```bash
# Record sleep
karinote sleep record --total 420 --deep 55 --note "Catching up after night shift"

# View last 7 days of sleep stats
karinote sleep stats --days 7

# Log mood
karinote mood log --mood 😊 --note "Code ran on first try"

# View today's mood
karinote mood today

# Mood distribution stats
karinote mood stats --days 7
```

---

## 📖 Command Reference

### 😴 Sleep

| Command | Description | Example |
|---------|-------------|---------|
| `sleep record` | Record sleep | `karinote sleep record --total 420 --deep 55` |
| `sleep stats` | Sleep statistics | `karinote sleep stats --days 7` |
| `sleep show` | View a specific day | `karinote sleep show --date 2026-06-03` |

**Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `--date` | No | Date YYYY-MM-DD (default: today) |
| `--total` | Yes | Total sleep in minutes |
| `--deep` | No | Deep sleep in minutes |
| `--awake` | No | Awake time in minutes |
| `--rem` | No | REM sleep in minutes |
| `--core` | No | Core sleep in minutes |
| `--note` | No | Notes |

### 💭 Mood

| Command | Description | Example |
|---------|-------------|---------|
| `mood log` | Log mood | `karinote mood log --mood 😊 --note "Happy"` |
| `mood today` | Today's mood | `karinote mood today` |
| `mood stats` | Mood statistics | `karinote mood stats --days 7` |

### 📊 Output Example

```
$ karinote sleep stats --days 3
Date         Total    Deep
-------------------------------
2026-06-01   6h0m     60m
2026-06-02   6h30m    48m
2026-06-03   7h0m     55m
-------------------------------
Avg          6h30m    54.3m
```

---

## 💾 Data Storage

Default data directories:

| Platform | Path |
|----------|------|
| Windows | `%USERPROFILE%\.karinote\` |
| Linux/macOS | `~/.local/share/karinote/` |

Customize via the `KARINOTE_DATA_DIR` environment variable.

The directory and `karinote.db` database file are created automatically on first run.

---

## 📁 Project Structure

```
karinote/
├── karinote.py          # CLI entry point
├── db.py                # Database initialization, connections
├── config.py            # Config file reading, data directory
├── utils.py             # Date formatting, table printing
├── RedPar/              # E-butler desktop pet
├── commands/
│   ├── sleep.py         # Sleep commands
│   └── mood.py          # Mood commands
├── CHANGELOG.md         # Changelog
├── README.md            # Chinese README
└── README.en.md         # This file
```

---

## 📄 License

MIT
