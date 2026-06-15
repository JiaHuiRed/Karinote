/**
 * RedPar 主应用
 */
import { Live2DManager } from './live2d';
import { speak, playCurrentAudio, stopPlayback, getApiKey, setApiKey, chat, setKarinoteContext } from './tts';
import { fetchKarinoteData, formatDataForLLM } from './karinote';

// --- DOM refs ---
const canvas = document.getElementById('live2d-canvas') as HTMLCanvasElement;
const chatInput = document.getElementById('chat-input') as HTMLInputElement;
const sendBtn = document.getElementById('send-btn') as HTMLButtonElement;
const messagesEl = document.getElementById('messages')!;
const statusDot = document.getElementById('status-dot')!;
const statusText = document.getElementById('status-text')!;
const pinToggle = document.getElementById('pin-toggle')!;
const closeBtn = document.getElementById('close-btn')!;
const apiKeyBtn = document.getElementById('apikey-btn')!;
const setupOverlay = document.getElementById('setup-overlay')!;
const setupKeyInput = document.getElementById('setup-key') as HTMLInputElement;
const setupSaveBtn = document.getElementById('setup-save')!;
const setupError = document.getElementById('setup-error')!;

const container = document.getElementById('live2d-container')!;

let live2d: Live2DManager | null = null;
let isPinned = false;
let abortController: AbortController | null = null;

// --- Settings helpers ---
function showSetup() {
  setupOverlay.style.display = 'flex';
  setupKeyInput.value = getApiKey();
  setupKeyInput.focus();
}

function hideSetup() { setupOverlay.style.display = 'none'; }

// Ollama 不需要 key，只有 TTS 需要
// 首次启动不再强制弹设置框

setupSaveBtn.addEventListener('click', () => {
  const key = setupKeyInput.value.trim();
  if (!key) {
    setupError.textContent = 'Key 不能为空';
    return;
  }
  if (!key.startsWith('sk-') && !key.includes('')) {
    // Allow any key format, the API will validate
  }
  setApiKey(key);
  setupError.textContent = '';
  hideSetup();
  addMessage('✅ API Key 已设置，可以开始聊天啦～', 'system');
});

setupKeyInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') setupSaveBtn.click();
});

apiKeyBtn.addEventListener('click', showSetup);

// --- Init Live2D ---
async function init() {
  const rect = container.getBoundingClientRect();
  console.log('[RedPar] Init Live2D with size:', rect.width, 'x', rect.height);

  statusDot.className = 'loading';
  statusText.textContent = '加载模型中...';

  try {
    live2d = new Live2DManager({
      canvas,
      width: rect.width,
      height: rect.height,
    });

    await live2d.loadModel();
    statusDot.className = '';
    statusText.textContent = '就绪';
    console.log('[RedPar] Live2D model loaded successfully');

    // 加载 Karinote 数据上下文
    statusText.textContent = '读取数据中...';
    const karinoteData = await fetchKarinoteData(7);
    const context = formatDataForLLM(karinoteData);
    if (context) {
      setKarinoteContext(context);
      console.log('[Karinote] Data context loaded');
    }
    statusText.textContent = '就绪';
    addMessage('🐳 嗨～ 我是雨琦，我看了你的记录哦~ 打字跟我聊天吧！', 'system');
  } catch (err) {
    statusDot.className = '';
    statusDot.style.background = '#ef4444';
    statusText.textContent = '模型加载失败';
    addMessage(`❌ 模型加载失败: ${err}`, 'system');
    console.error('[RedPar] Live2D load error:', err);
  }
}

// Delay init slightly to ensure DOM is ready
setTimeout(init, 100);

// --- Messages ---
function addMessage(text: string, type: 'user' | 'char' | 'system') {
  const el = document.createElement('div');
  el.className = `msg ${type}`;
  el.textContent = text;
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// --- Send & TTS ---
async function handleSend() {
  const text = chatInput.value.trim();
  if (!text) return;

  chatInput.value = '';
  addMessage(text, 'user');
  sendBtn.disabled = true;

  abortController = new AbortController();

  try {
    // Step 1: LLM 生成回复
    addMessage('💭 思考中...', 'system');
    statusText.textContent = '思考中...';

    const reply = await chat(text, abortController.signal);

    // 显示回复
    const msgs = messagesEl.querySelectorAll('.msg');
    const last = msgs[msgs.length - 1];
    if (last?.textContent === '💭 思考中...') last.remove();
    addMessage(reply, 'char');

    // Step 2: TTS 合成语音（需要 API Key）
    if (getApiKey()) {
      statusText.textContent = '合成语音中...';

      await speak({
        text: reply,
        signal: abortController.signal,
        onDone: () => {
          statusText.textContent = '播放中';
        },
      });

      await playCurrentAudio();
    }
    statusText.textContent = '就绪';
  } catch (err: any) {
    if (err.name === 'AbortError') return;
    const msgs = messagesEl.querySelectorAll('.msg');
    const last = msgs[msgs.length - 1];
    if (last?.textContent === '💭 思考中...') last.remove();
    addMessage(`❌ ${err.message}`, 'system');
    statusText.textContent = '出错';
    console.error('[RedPar] Error:', err);
  } finally {
    sendBtn.disabled = false;
    abortController = null;
    chatInput.focus();
  }
}

// --- Events ---
sendBtn.addEventListener('click', handleSend);
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});

// Toggle mouse ignore (click-through)
pinToggle.addEventListener('click', () => {
  isPinned = !isPinned;
  const api = (window as any).electronAPI;
  if (api) api.setIgnoreMouseEvents(isPinned);
  pinToggle.textContent = isPinned ? '🔓' : '📌';
  pinToggle.title = isPinned ? '穿透模式（不可交互）' : '交互模式';
});

// Close
closeBtn.addEventListener('click', () => {
  stopPlayback();
  const api = (window as any).electronAPI;
  if (api) api.windowClose();
});
