import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase-server';
import { getSitesByOwner, createSite } from '@siteforge/db';
import Anthropic from '@anthropic-ai/sdk';

const THEME_SYSTEM_PROMPT = `You are a web design system generator. Given a natural language description of a desired website style, generate a complete theme configuration as JSON.

You MUST respond with ONLY a valid JSON object, no markdown, no explanation.

The JSON must follow this exact structure:
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

Design axis guidance:
- Narrow (1040-1080px) + larger spacing (2rem) + lineHeight 1.75-1.8 + headingWeight 600 → editorial / reading-first (律師, 餐飲, 設計, 文化)
- Wide (1200-1280px) + tighter spacing (1.25-1.5rem) + lineHeight 1.6 + headingWeight 800 → bold / modern / dense (科技, 零售, 電商)
- Balanced (1120px) + spacing 1.5-1.75rem + lineHeight 1.7 + headingWeight 700 → corporate / clean / versatile (醫療, 財務, 教育, 其他服務)

Pick ONE direction that matches the described mood — don't default to "balanced" for every request.`;

async function generateThemeInBackground(serviceClient: any, siteId: string, ai_prompt: string) {
  try {
    const client = new Anthropic();
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: THEME_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Design a website theme based on this description: "${ai_prompt}"` }],
    });
    const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
    const themeConfig = JSON.parse(text);
    await serviceClient.from('sites').update({
      theme_config: { ...themeConfig, ai_prompt },
    }).eq('id', siteId);
  } catch {
    // silently fail — user can regenerate from theme page
  }
}

export async function GET() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const sites = await getSitesByOwner(supabase as any, user.id);
  return NextResponse.json(sites);
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, slug, ai_prompt } = await req.json();
  if (!name || !slug) return NextResponse.json({ error: 'name and slug required' }, { status: 400 });

  const serviceClient = createServiceClient();
  const site = await createSite(serviceClient, { name, slug, owner_id: user.id });

  // Save ai_prompt and kick off theme generation in background (non-blocking)
  if (ai_prompt) {
    await serviceClient.from('sites')
      .update({ theme_config: { ...site.theme_config, ai_prompt } })
      .eq('id', site.id);

    generateThemeInBackground(serviceClient, site.id, ai_prompt);
  }

  return NextResponse.json(site, { status: 201 });
}
