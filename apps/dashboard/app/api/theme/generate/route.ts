import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `You are a web design system generator. Given a natural language description of a desired website style, generate a complete theme configuration as JSON.

You MUST respond with ONLY a valid JSON object, no markdown, no explanation.

Generate 3 variants and respond as: { "variants": [variant1, variant2, variant3] }

Each variant follows this exact structure:
{
  "colors": {
    "primary": "<hex>",
    "accent": "<hex>",
    "background": "<hex>",
    "surface": "<hex>",
    "text": "<hex>",
    "textSecondary": "<hex>",
    "border": "<hex>"
  },
  "typography": {
    "headingFont": "<Google Font name>",
    "bodyFont": "<Google Font name>",
    "baseFontSize": "16px",
    "headingWeight": "700",
    "lineHeight": "1.6"
  },
  "layout": {
    "maxWidth": "1200px",
    "borderRadius": "<px value>",
    "spacing": "1.5rem",
    "headerStyle": "fixed"
  }
}

Available Google Fonts: Inter, Noto Sans TC, Noto Sans JP, Plus Jakarta Sans, DM Sans, Outfit, Manrope, Space Grotesk, Noto Serif TC, Noto Serif JP, Playfair Display, Lora, Source Serif Pro, Crimson Text

Guidelines:
- Colors must have sufficient contrast (WCAG AA)
- primary for headers/nav, accent for CTAs/links, background for page, surface for cards
- borderRadius: "0px" corporate, "8px" modern, "16px" friendly, "9999px" pill
- Variant 1: close match, Variant 2: bolder/dramatic, Variant 3: minimal/subtle`;

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { prompt } = await req.json();
  if (!prompt) return NextResponse.json({ error: 'prompt required' }, { status: 400 });

  try {
    const client = new Anthropic();
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Design a website theme based on this description: "${prompt}"` }],
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
    const parsed = JSON.parse(text);

    if (!parsed.variants || !Array.isArray(parsed.variants)) {
      return NextResponse.json({ error: 'AI 回傳格式錯誤，請再試一次' }, { status: 500 });
    }

    return NextResponse.json({ variants: parsed.variants });
  } catch (err) {
    console.error('[theme/generate]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '生成失敗，請再試一次' },
      { status: 500 }
    );
  }
}
