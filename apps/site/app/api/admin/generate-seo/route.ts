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
      content: `根據以下文章，生成 SEO 資料。只輸出 JSON，不要有其他文字。

格式：{"seoTitle":"<60字以內的Meta標題>","seoDescription":"<155字以內的Meta描述>"}

文章標題：${title}
內文摘要：${(content || '').slice(0, 1000)}`,
    }],
  });

  const raw = msg.content[0].type === 'text' ? msg.content[0].text : '{}';
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    const data = match ? JSON.parse(match[0]) : {};
    return NextResponse.json({ seoTitle: data.seoTitle ?? '', seoDescription: data.seoDescription ?? '' });
  } catch {
    return NextResponse.json({ seoTitle: '', seoDescription: '' });
  }
}
