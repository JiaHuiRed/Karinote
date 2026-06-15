/**
 * MiMo TTS 模块
 * 使用小米 MiMo TTS API（OpenAI 兼容格式）
 */

// 从 localStorage 读取 API key
function getApiKey(): string {
  return localStorage.getItem('mimo_api_key') || '';
}

function setApiKey(key: string) {
  localStorage.setItem('mimo_api_key', key);
}

function getVoice(): string {
  return localStorage.getItem('mimo_voice') || '冰糖';
}

function setVoice(voice: string) {
  localStorage.setItem('mimo_voice', voice);
}

const BASE_URL = 'https://api.xiaomimimo.com/v1';
const TTS_BASE_URL = BASE_URL;
const TTS_MODEL = 'mimo-v2.5-tts';
const CHAT_BASE_URL = 'http://localhost:11434/v1';
const CHAT_MODEL = 'qwen3-vl:8b';

// --- LLM Chat ---
const SYSTEM_PROMPT_BASE = `你是雨琦，一个可爱的数字人桌宠。你住在主人的电脑桌面上，性格活泼开朗，说话风格像朋友一样自然亲切。
规则：
- 回复简短（1-2句话），像日常聊天
- 用中文回复
- 可以用 emoji，但不要太多
- 语气可爱但不做作

你也是主人的电子生活管家，能看到他的睡眠、运动、心情等记录。根据这些数据主动关心他：
- 看到他睡得好就夸夸他，睡得少就催他早睡
- 运动有进步就鼓励他，偷懒了就念叨两句
- 心情不好的时候多哄哄`;

let karinoteContext = '';

/**
 * 设置 Karinote 数据上下文（由 app.ts 启动时调用）
 * 数据会自动注入到 LLM 的 system prompt 中
 */
export function setKarinoteContext(context: string) {
  karinoteContext = context;
  // 刷新 system message
  rebuildSystemMessage();
}

function buildSystemMessage(): string {
  let prompt = SYSTEM_PROMPT_BASE;
  if (karinoteContext) {
    prompt += `\n\n【主人的近期数据】\n${karinoteContext}\n\n根据这些数据，主动关心主人、做对比分析、给建议。如果数据为空就正常聊天。`;
  }
  return prompt;
}

function rebuildSystemMessage() {
  if (chatHistory.length > 0) {
    chatHistory[0] = { role: 'system', content: buildSystemMessage() };
  }
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

let chatHistory: ChatMessage[] = [
  { role: 'system', content: buildSystemMessage() },
];

export async function chat(userText: string, signal?: AbortSignal): Promise<string> {
  // 每次聊天前刷新 system prompt（数据可能已更新）
  rebuildSystemMessage();
  chatHistory.push({ role: 'user', content: userText });

  const response = await fetch(`${CHAT_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages: chatHistory,
      stream: false,
    }),
    signal,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Chat API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content || '...';

  chatHistory.push({ role: 'assistant', content: reply });

  // Keep history manageable (last 20 exchanges)
  if (chatHistory.length > 41) {
    chatHistory = [chatHistory[0], ...chatHistory.slice(-40)];
  }

  return reply;
}

// --- TTS ---
export interface TTSOptions {
  text: string;
  voice?: string;
  style?: string;
  onChunk?: (audioChunk: ArrayBuffer) => void;
  onDone?: () => void;
  onError?: (err: Error) => void;
  signal?: AbortSignal;
}

/**
 * 调用 MiMo TTS API 合成语音
 * 由于 Electron 中 fetch 不走系统代理，此请求直连小米 API
 */
export async function speak(options: TTSOptions): Promise<void> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('请先设置 MiMo API Key');
  }

  const voice = options.voice || getVoice();
  const style = options.style || '温柔、自然、像朋友一样说话';

  const body = {
    model: TTS_MODEL,
    messages: [
      {
        role: 'user' as const,
        content: style,
      },
      {
        role: 'assistant' as const,
        content: options.text,
      },
    ],
    audio: {
      format: 'pcm16',
      voice: voice,
    },
    stream: true,
  };

  const response = await fetch(`${TTS_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: options.signal,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`TTS API error ${response.status}: ${errText}`);
  }

  // Read the stream
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  // Collect all PCM chunks
  const pcmChunks: Float32Array[] = [];
  let chunkCount = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const jsonStr = trimmed.slice(6);
        if (jsonStr === '[DONE]') continue;

        try {
          const chunk = JSON.parse(jsonStr);
          const audioData = chunk?.choices?.[0]?.delta?.audio?.data;
          if (!audioData) continue;

          // Decode base64 PCM16 to Float32Array
          const binary = atob(audioData);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }

          const pcm16 = new Int16Array(bytes.buffer);
          const float32 = new Float32Array(pcm16.length);
          for (let i = 0; i < pcm16.length; i++) {
            float32[i] = pcm16[i] / 32768.0;
          }

          pcmChunks.push(float32);
          chunkCount++;

          // Also send raw PCM bytes for playback
          if (options.onChunk) {
            options.onChunk(bytes.buffer as ArrayBuffer);
          }
        } catch {
          // Skip malformed JSON lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  // Concatenate all PCM chunks
  if (pcmChunks.length === 0) {
    throw new Error('未收到音频数据');
  }

  // Store complete audio for playback
  const totalLen = pcmChunks.reduce((sum, c) => sum + c.length, 0);
  const complete = new Float32Array(totalLen);
  let offset = 0;
  for (const chunk of pcmChunks) {
    complete.set(chunk, offset);
    offset += chunk.length;
  }

  currentAudioBuffer = complete;
  options.onDone?.();
}

let currentAudioBuffer: Float32Array | null = null;
let audioContext: AudioContext | null = null;
let sourceNode: AudioBufferSourceNode | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext({ sampleRate: 24000 });
  }
  return audioContext;
}

/**
 * 播放当前合成的语音
 */
export function playCurrentAudio(): Promise<void> {
  if (!currentAudioBuffer) return Promise.resolve();

  const ctx = getAudioContext();
  const buffer = ctx.createBuffer(1, currentAudioBuffer.length, 24000);
  buffer.getChannelData(0).set(currentAudioBuffer);

  sourceNode = ctx.createBufferSource();
  sourceNode.buffer = buffer;
  sourceNode.connect(ctx.destination);
  sourceNode.start();
  sourceNode.onended = () => {
    currentAudioBuffer = null;
  };

  return new Promise((resolve) => {
    sourceNode!.onended = () => {
      currentAudioBuffer = null;
      resolve();
    };
  });
}

/**
 * 停止播放
 */
export function stopPlayback() {
  if (sourceNode) {
    try { sourceNode.stop(); } catch {}
    sourceNode.disconnect();
    sourceNode = null;
  }
  currentAudioBuffer = null;
}

export { getApiKey, setApiKey, getVoice, setVoice };
