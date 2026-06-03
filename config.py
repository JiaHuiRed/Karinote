import os
import json
from pathlib import Path

DEFAULT_DATA_DIR = Path.home() / ".karinote"
CONFIG_FILE = "config.json"


def get_data_dir() -> Path:
    env_dir = os.environ.get("KARINOTE_DATA_DIR")
    if env_dir:
        return Path(env_dir)
    return DEFAULT_DATA_DIR


def ensure_data_dir() -> Path:
    data_dir = get_data_dir()
    data_dir.mkdir(parents=True, exist_ok=True)
    return data_dir


def get_db_path() -> Path:
    return ensure_data_dir() / "karinote.db"


def load_config() -> dict:
    config_path = ensure_data_dir() / CONFIG_FILE
    if config_path.exists():
        with open(config_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_config(config: dict):
    config_path = ensure_data_dir() / CONFIG_FILE
    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
