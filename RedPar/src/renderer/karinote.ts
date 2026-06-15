/**
 * Karinote 数据上下文模块
 * 从 Karinote SQLite 数据库拉取数据，格式化后供 LLM 使用
 */

export interface SleepEntry {
  id?: number;
  date: string;
  total_min: number;
  deep_min?: number;
  awake_min?: number;
  rem_min?: number;
  core_min?: number;
  note?: string;
}

export interface MoodEntry {
  id?: number;
  datetime: string;
  mood: string;
  note?: string;
}

export interface BodyEntry {
  id?: number;
  date: string;
  sport_min?: number;
  skin?: string;
  energy?: number;
  coffee?: number;
  note?: string;
}

export interface TrackEntry {
  id?: number;
  date: string;
  name: string;
  value: number;
  note?: string;
}

export interface KarinoteData {
  sleep: SleepEntry[];
  mood: MoodEntry[];
  body: BodyEntry[];
  track: TrackEntry[];
}

const api = () => (window as any).electronAPI;

/**
 * 拉取所有 Karinote 数据
 */
export async function fetchKarinoteData(days = 3): Promise<KarinoteData> {
  try {
    const result = await api().karinoteQuery('all', days);
    const parsed = JSON.parse(result);
    if (parsed.error) {
      console.warn('[Karinote] Query error:', parsed.error);
      return { sleep: [], mood: [], body: [], track: [] };
    }
    return parsed;
  } catch (err) {
    console.warn('[Karinote] Fetch failed:', err);
    return { sleep: [], mood: [], body: [], track: [] };
  }
}

/**
 * 写入数据到 Karinote
 */
export async function writeKarinote(type: string, data: object) {
  try {
    const result = await api().karinoteWrite(type, data);
    return JSON.parse(result);
  } catch (err) {
    console.warn('[Karinote] Write failed:', err);
    return { error: String(err) };
  }
}

function minsToHm(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}小时${m}分钟` : `${m}分钟`;
}

/**
 * 将 Karinote 数据格式化为 LLM 可读的文本摘要
 */
export function formatDataForLLM(data: KarinoteData): string {
  const parts: string[] = [];

  // 睡眠
  if (data.sleep.length > 0) {
    const lines = data.sleep.map((s) => {
      let line = `  ${s.date}: 睡了 ${minsToHm(s.total_min)}`;
      if (s.deep_min) line += `，深睡 ${s.deep_min}分钟`;
      if (s.note) line += `（备注: ${s.note}）`;
      return line;
    });
    parts.push('【睡眠记录】\n' + lines.join('\n'));

    // 对比：跟昨天比
    if (data.sleep.length >= 2) {
      const today = data.sleep[0];
      const yesterday = data.sleep[1];
      const diff = today.total_min - yesterday.total_min;
      if (diff !== 0) {
        const dir = diff > 0 ? '多了' : '少了';
        parts.push(`（相比最近一次，${dir} ${Math.abs(diff)}分钟）`);
      }
    }
  }

  // 心情
  if (data.mood.length > 0) {
    const lines = data.mood.map((m) => {
      let line = `  ${m.datetime}: ${m.mood}`;
      if (m.note) line += ` — ${m.note}`;
      return line;
    });
    parts.push('【心情记录】\n' + lines.join('\n'));
  }

  // 身体/运动
  if (data.body.length > 0) {
    const lines = data.body.map((b) => {
      const items: string[] = [];
      if (b.sport_min) items.push(`运动 ${b.sport_min}分钟`);
      if (b.energy) items.push(`精力 ${b.energy}/10`);
      if (b.coffee) items.push(`咖啡 ${b.coffee}杯`);
      if (b.skin) items.push(`皮肤: ${b.skin}`);
      let line = `  ${b.date}: ${items.join('、')}`;
      if (b.note) line += `（${b.note}）`;
      return line;
    });
    parts.push('【身体/运动】\n' + lines.join('\n'));
  }

  // 自定义追踪
  if (data.track.length > 0) {
    const byName = new Map<string, TrackEntry[]>();
    for (const t of data.track) {
      const list = byName.get(t.name) || [];
      list.push(t);
      byName.set(t.name, list);
    }
    for (const [name, entries] of byName) {
      const lines = entries.map(
        (e) => `  ${e.date}: ${e.value}${e.note ? `（${e.note}）` : ''}`,
      );
      parts.push(`【${name}】\n` + lines.join('\n'));
    }
  }

  return parts.join('\n\n');
}
