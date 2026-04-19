import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'AI 功能未啟用' }, { status: 503 });

  const { title, content } = await req.json();

  const client = new Anthropic();
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `請校對以下繁體中文文章，找出錯別字、漏字、語法問題。只輸出 JSON，不要有其他文字。

若無錯誤，輸出：{"errors":[],"message":"未發現明顯錯誤"}
若有錯誤，輸出：{"errors":[{"wrong":"錯誤文字","correct":"正確文字","reason":"說明"}],"message":"發現 N 處問題"}

標題：${title}
內文：${(content || '').slice(0, 3000)}`,
    }],
  });

  const raw = msg.content[0].type === 'text' ? msg.content[0].text : '{}';
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    const data = match ? JSON.parse(match[0]) : { errors: [], message: '解析失敗' };
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ errors: [], message: '解析失敗' });
  }
}
