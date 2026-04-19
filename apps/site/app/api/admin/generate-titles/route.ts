import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'AI 功能未啟用' }, { status: 503 });

  const { title, content } = await req.json();

  const client = new Anthropic();
  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `根據以下文章，用繁體中文生成 3 個吸引人的標題建議。只輸出 JSON 陣列，格式：["標題1","標題2","標題3"]

現有標題：${title || '（未填）'}
內文摘要：${(content || '').slice(0, 800)}`,
    }],
  });

  const raw = msg.content[0].type === 'text' ? msg.content[0].text : '[]';
  try {
    const match = raw.match(/\[[\s\S]*\]/);
    const titles = match ? JSON.parse(match[0]) : [];
    return NextResponse.json({ titles });
  } catch {
    return NextResponse.json({ titles: [] });
  }
}
