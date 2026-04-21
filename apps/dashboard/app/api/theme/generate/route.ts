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
    "baseFontSize": "<16px|17px>",
    "headingWeight": "<600|700|800>",
    "lineHeight": "<1.6|1.7|1.75|1.8>"
  },
  "layout": {
    "maxWidth": "<1040px|1080px|1120px|1200px|1280px>",
    "borderRadius": "<0px|4px|6px|8px|12px>",
    "spacing": "<1.25rem|1.5rem|1.75rem|2rem>",
    "headerStyle": "fixed"
  }
}

Available Google Fonts: Inter, Noto Sans TC, Noto Sans JP, Plus Jakarta Sans, DM Sans, Outfit, Manrope, Space Grotesk, Noto Serif TC, Noto Serif JP, Playfair Display, Lora, Source Serif Pro, Crimson Text

Guidelines:
- Colors must have sufficient contrast (WCAG AA)
- primary for headers/nav, accent for CTAs/links, background for page, surface for cards

The three variants must differ on DESIGN AXES, not just colors:

**Variant 1 — Editorial / Narrow**（編輯雜誌感）
- maxWidth: "1040px" or "1080px"
- spacing: "2rem"
- lineHeight: "1.75" or "1.8"
- baseFontSize: "17px"
- headingWeight: "600"
- borderRadius: "0px" or "4px"
- Aesthetic: generous whitespace, reading-first, slightly serif-leaning (consider Noto Serif TC / Lora for heading if appropriate)

**Variant 2 — Bold Modern / Wide**（俐落現代感）
- maxWidth: "1200px" or "1280px"
- spacing: "1.5rem" or "1.25rem"
- lineHeight: "1.6"
- baseFontSize: "16px"
- headingWeight: "800"
- borderRadius: "12px"
- Aesthetic: punchy, confident, slightly denser, sans-serif bold (Plus Jakarta Sans, Space Grotesk, Outfit)

**Variant 3 — Minimal Clean / Balanced**（極簡平衡感）
- maxWidth: "1120px"
- spacing: "1.75rem"
- lineHeight: "1.7"
- baseFontSize: "16px"
- headingWeight: "700"
- borderRadius: "6px" or "8px"
- Aesthetic: neutral, versatile, clean (Inter, Manrope, DM Sans)

Colors still match the user's described mood across all 3 variants; the axis of variation is LAYOUT + TYPOGRAPHY SCALE, not color temperature.`;

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
