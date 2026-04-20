import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import Anthropic from '@anthropic-ai/sdk';

const INTERVIEW_SYSTEM = `你是 SiteForge 的專業網站顧問，正在透過對話了解客戶需求，以便生成一個高品質的專業網站。

你的任務是透過自然對話，依序蒐集以下資訊（每次只問一個問題）：
1. 業種/行業
2. 主要服務或產品內容
3. 目標客群是誰
4. 希望品牌給人什麼感覺（專業、溫暖、高端、活潑等）
5. 顏色偏好或品牌色（或有沒有不想要的顏色）
6. 和同行相比最大的優勢或特色
7. 是否需要文章/部落格系統？（例如定期發文、知識分享、案例介紹）
8. 有沒有想特別強調的內容或特殊需求
9. 最後問：還有什麼補充的嗎？

規則：
- 每次只說一句話問一個問題，簡短自然，像真人顧問在聊天
- 根據對方答案靈活調整，不需要死板照順序
- 如果對方回答含糊，可以追問一次讓答案更具體
- 問完 6-8 題且收到最後補充後，說一段話表示「我已經了解您的需求，馬上為您生成網站！」然後換行輸出：
  [READY_TO_BUILD]
  然後再換行輸出一個 JSON（不要加 markdown 標記，直接輸出）：
  {"summary":"<用一段話總結所有收集到的建站需求，包含業種、服務、客群、風格、顏色、優勢、特殊需求，內容越詳細越好>"}

第一次對話：直接問第一個問題，不需要打招呼或自我介紹。`;

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { messages, siteName } = await req.json();

  const client = new Anthropic();
  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    system: INTERVIEW_SYSTEM + (siteName ? `\n\n網站名稱：${siteName}` : ''),
    messages: messages.length === 0
      ? [{ role: 'user', content: '開始' }]
      : messages,
  });

  const raw = msg.content[0].type === 'text' ? msg.content[0].text : '';
  const readyToGenerate = raw.includes('[READY_TO_BUILD]');

  let reply = raw;
  let buildPrompt = '';

  if (readyToGenerate) {
    const parts = raw.split('[READY_TO_BUILD]');
    reply = parts[0].trim();
    const jsonPart = parts[1]?.trim() ?? '';
    try {
      const parsed = JSON.parse(jsonPart);
      buildPrompt = parsed.summary ?? '';
    } catch {
      buildPrompt = jsonPart.replace(/[{}"\n]/g, ' ').trim();
    }
  }

  return NextResponse.json({ reply, readyToGenerate, buildPrompt });
}
