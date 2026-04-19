import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import Anthropic from '@anthropic-ai/sdk';

function extractJson(text: string) {
  const start = text.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') { depth--; if (depth === 0) return text.slice(start, i + 1); }
  }
  return null;
}

const PROMPT = `你是一位資深文章寫作教練。根據文章標題與內容，提供 5 種不同風格的文章開場第一段（每段約 80〜130 字，繁體中文）。

5 種風格依序：
1. 數據震撼型 — 用具體數字直接震撼讀者
2. 場景代入型 — 從讀者可能遇到的場景切入
3. 問題懸疑型 — 用反問讓讀者迫不及待往下讀
4. 故事敘事型 — 從一個小故事或案例開始
5. 觀點衝突型 — 提出打破常識的反直觀觀點

只輸出嚴格 JSON：{"suggestions":[{"style":"數據震撼型","text":"..."},{"style":"場景代入型","text":"..."},{"style":"問題懸疑型","text":"..."},{"style":"故事敘事型","text":"..."},{"style":"觀點衝突型","text":"..."}]}`;

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'AI 功能未啟用' }, { status: 503 });

  const { title, content } = await req.json();

  const client = new Anthropic();
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `${PROMPT}\n\n文章標題：${title ?? '（未填）'}\n文章內容：${(content ?? '').replace(/<[^>]+>/g, '').slice(0, 3000)}`,
    }],
  });

  const raw = msg.content[0].type === 'text' ? msg.content[0].text : '{}';
  const json = extractJson(raw);
  try {
    return NextResponse.json(json ? JSON.parse(json) : { suggestions: [] });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
