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
}`;

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

  if (ai_prompt) {
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
      }).eq('id', site.id);
      site.theme_config = { ...themeConfig, ai_prompt };
    } catch {
      // AI generation failed; site is still created with defaults
    }
  }

  return NextResponse.json(site, { status: 201 });
}
