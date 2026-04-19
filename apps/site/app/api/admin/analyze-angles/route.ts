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

const PROMPT = `你是一位資深內容策略師。根據提供的文章，分析其資訊價值並提供 6 個不同的報導切角。

每個切角包含：
- title：切角標題（10〜20字）
- description：核心觀點與潛在讀者（2〜3句）
- hook：適合社群分享的一句話金句

只輸出嚴格 JSON：{"angles":[{"title":"...","description":"...","hook":"..."}]}`;

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'AI 功能未啟用' }, { status: 503 });

  const { title, content } = await req.json();

  const client = new Anthropic();
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    messages: [{
      role: 'user',
      content: `${PROMPT}\n\n文章標題：${title ?? '（未填）'}\n文章內容：${(content ?? '').replace(/<[^>]+>/g, '').slice(0, 3000)}`,
    }],
  });

  const raw = msg.content[0].type === 'text' ? msg.content[0].text : '{}';
  const json = extractJson(raw);
  try {
    return NextResponse.json(json ? JSON.parse(json) : { angles: [] });
  } catch {
    return NextResponse.json({ angles: [] });
  }
}
