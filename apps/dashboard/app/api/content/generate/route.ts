import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `你是一個專業的網站內容撰寫助理。用戶會描述他的網站性質、目標受眾、以及想要的內容結構，你要根據這些資訊幫他生成網站各區塊的內容。

回覆時，根據對話脈絡提供具體的文字內容，格式如下：
- 如果用戶要求生成多個區塊，逐一列出每個區塊的標題與內容
- 內容要自然、有說服力、符合台灣繁體中文習慣
- 若用戶提供了固定要用的文字，請保留並融入
- 文章內容請提供完整段落，不是大綱
- 跑馬燈文字請提供5-10則簡短句子
- 最新消息請提供3-5則，含標題與簡短內文
- 保持友善、對話式的語氣，可以追問用戶以取得更多細節

你可以生成的內容類型：
- 文章（為什麼選擇我們、服務介紹、收費標準、關於我們等）
- 最新消息列表
- 跑馬燈滾動文字
- Hero 區塊標題與副標題
- 頁尾版權文字與連結建議`;

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { messages, siteId } = await req.json();
  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'messages required' }, { status: 400 });
  }

  let siteContext = '';
  if (siteId) {
    const { data: site } = await supabase
      .from('sites')
      .select('name, module_config, theme_config')
      .eq('id', siteId)
      .single();
    if (site) {
      const enabledModules = Object.entries(site.module_config as Record<string, { enabled: boolean }>)
        .filter(([, v]) => v.enabled)
        .map(([k]) => k)
        .join(', ');
      const aiPrompt = (site.theme_config as any)?.ai_prompt;
      siteContext = `\n\n目前網站名稱：${site.name}\n已啟用的模組：${enabledModules || '無'}${aiPrompt ? `\n網站風格描述：${aiPrompt}` : ''}`;
    }
  }

  try {
    const client = new Anthropic();
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT + siteContext,
      messages,
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error('[content/generate]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '生成失敗，請再試一次' },
      { status: 500 }
    );
  }
}
