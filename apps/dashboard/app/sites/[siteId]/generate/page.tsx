'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Message { role: 'user' | 'assistant'; content: string; }

type Tab = 'quickbuild' | 'chat';

interface PreviewData {
  layout?: { heroLayout?: string; articlesLayout?: string; newsLayout?: string };
  theme: any;
  hero: any;
  articles: Array<{ title: string; category?: string }>;
  news: Array<{ title: string }>;
  marquee: string[];
}

function VisualPreview({ preview, siteName }: { preview: PreviewData; siteName: string }) {
  const c = preview.theme?.colors ?? {};
  const t = preview.theme?.typography ?? {};
  const l = preview.layout ?? {};
  const radius = preview.theme?.layout?.borderRadius ?? '6px';

  const vars = {
    '--p': c.primary ?? '#1a2f4a',
    '--a': c.accent ?? '#b8973a',
    '--bg': c.background ?? '#ffffff',
    '--sf': c.surface ?? '#f8fafc',
    '--tx': c.text ?? '#1a1a1a',
    '--ts': c.textSecondary ?? '#64748b',
    '--bd': c.border ?? '#e2e8f0',
    '--hf': `"${t.headingFont ?? 'Inter'}", "Noto Sans TC", sans-serif`,
    '--r': radius,
  } as React.CSSProperties;

  return (
    <div style={{ ...vars, background: 'var(--bg)', fontFamily: '"Noto Sans TC", sans-serif', fontSize: 12 }}
      className="rounded-xl overflow-hidden border border-slate-200 shadow-md">

      {/* Browser chrome */}
      <div className="bg-slate-100 px-3 py-2 flex items-center gap-2 border-b border-slate-200">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 block" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 block" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400 block" />
        </div>
        <div className="flex-1 bg-white rounded text-[10px] text-slate-400 px-3 py-0.5 text-center border border-slate-200">
          yoursite.vercel.app
        </div>
      </div>

      {/* Header */}
      <div style={{ background: 'var(--sf)', borderBottom: '1px solid var(--bd)', padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--p)', fontFamily: 'var(--hf)', fontWeight: 700, fontSize: 13 }}>{siteName}</span>
        <div style={{ display: 'flex', gap: 14 }}>
          {['首頁', '文章', '消息', '聯絡'].map(link => (
            <span key={link} style={{ color: 'var(--tx)', fontSize: 10 }}>{link}</span>
          ))}
        </div>
      </div>

      {/* Hero — minimal */}
      {l.heroLayout === 'minimal' && (
        <div style={{ background: 'var(--sf)', borderBottom: '1px solid var(--bd)', padding: '28px 24px', textAlign: 'center' }}>
          <div style={{ width: 24, height: 3, background: 'var(--a)', margin: '0 auto 10px', borderRadius: 99 }} />
          <div style={{ color: 'var(--p)', fontFamily: 'var(--hf)', fontWeight: 700, fontSize: 20, marginBottom: 6, lineHeight: 1.3 }}>{preview.hero?.title}</div>
          <div style={{ color: 'var(--ts)', fontSize: 11, marginBottom: 12, maxWidth: 360, margin: '0 auto 12px' }}>{preview.hero?.subtitle}</div>
          <div style={{ display: 'inline-block', border: `2px solid var(--p)`, color: 'var(--p)', padding: '4px 14px', borderRadius: radius, fontSize: 10, fontWeight: 600 }}>{preview.hero?.ctaText}</div>
        </div>
      )}

      {/* Hero — split */}
      {l.heroLayout === 'split' && (
        <div style={{ display: 'flex', minHeight: 120 }}>
          <div style={{ flex: 1, background: 'var(--bg)', padding: '24px 28px' }}>
            <div style={{ width: 20, height: 3, background: 'var(--a)', marginBottom: 8, borderRadius: 99 }} />
            <div style={{ color: 'var(--tx)', fontFamily: 'var(--hf)', fontWeight: 700, fontSize: 17, marginBottom: 6, lineHeight: 1.3 }}>{preview.hero?.title}</div>
            <div style={{ color: 'var(--ts)', fontSize: 10, marginBottom: 10 }}>{preview.hero?.subtitle}</div>
            <div style={{ display: 'inline-block', background: 'var(--p)', color: '#fff', padding: '4px 12px', borderRadius: radius, fontSize: 10, fontWeight: 600 }}>{preview.hero?.ctaText}</div>
          </div>
          <div style={{ width: '38%', background: `linear-gradient(145deg, ${c.primary ?? '#1a2f4a'}, ${c.accent ?? '#b8973a'})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ color: '#fff', fontFamily: 'var(--hf)', fontWeight: 900, fontSize: 36, opacity: 0.15, lineHeight: 1 }}>{preview.hero?.title?.slice(0, 2)}</div>
          </div>
        </div>
      )}

      {/* Hero — centered (gradient) */}
      {(l.heroLayout === 'centered' || !l.heroLayout) && (
        <div style={{ background: `linear-gradient(135deg, ${c.primary ?? '#1a2f4a'}, ${c.accent ?? '#b8973a'})`, padding: '28px 24px', textAlign: 'center' }}>
          <div style={{ width: 24, height: 3, background: 'rgba(255,255,255,0.5)', margin: '0 auto 10px', borderRadius: 99 }} />
          <div style={{ color: '#fff', fontFamily: 'var(--hf)', fontWeight: 700, fontSize: 20, marginBottom: 6 }}>{preview.hero?.title}</div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, marginBottom: 12 }}>{preview.hero?.subtitle}</div>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', padding: '4px 14px', borderRadius: radius, fontSize: 10, fontWeight: 600 }}>{preview.hero?.ctaText}</div>
        </div>
      )}

      {/* Articles */}
      {(preview.articles?.length ?? 0) > 0 && (
        <div style={{ background: 'var(--bg)', padding: '18px 20px' }}>
          <div style={{ color: 'var(--tx)', fontFamily: 'var(--hf)', fontWeight: 700, fontSize: 13, marginBottom: 12 }}>文章</div>

          {/* Grid */}
          {(l.articlesLayout === 'grid' || !l.articlesLayout) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {preview.articles.slice(0, 3).map((a, i) => (
                <div key={i} style={{ background: 'var(--sf)', border: '1px solid var(--bd)', borderRadius: radius, overflow: 'hidden' }}>
                  <div style={{ height: 52, background: `linear-gradient(135deg, ${c.primary ?? '#1a2f4a'}28, ${c.accent ?? '#b8973a'}28)` }} />
                  <div style={{ padding: '8px 10px' }}>
                    {a.category && <div style={{ color: 'var(--a)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>{a.category}</div>}
                    <div style={{ color: 'var(--tx)', fontWeight: 600, fontSize: 10, lineHeight: 1.4 }}>{a.title}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Magazine */}
          {l.articlesLayout === 'magazine' && (
            <div>
              <div style={{ background: 'var(--sf)', border: '1px solid var(--bd)', borderRadius: radius, display: 'flex', marginBottom: 8, overflow: 'hidden' }}>
                <div style={{ width: '45%', height: 80, background: `linear-gradient(135deg, ${c.primary ?? '#1a2f4a'}33, ${c.accent ?? '#b8973a'}33)`, flexShrink: 0 }} />
                <div style={{ flex: 1, padding: 10 }}>
                  {preview.articles[0]?.category && <div style={{ color: 'var(--a)', fontSize: 9, fontWeight: 700, marginBottom: 3 }}>{preview.articles[0].category}</div>}
                  <div style={{ color: 'var(--tx)', fontWeight: 700, fontSize: 12, lineHeight: 1.4 }}>{preview.articles[0]?.title}</div>
                  <div style={{ color: 'var(--ts)', fontSize: 9, marginTop: 4 }}>精選內容</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
                {preview.articles.slice(1, 4).map((a, i) => (
                  <div key={i} style={{ background: 'var(--sf)', border: '1px solid var(--bd)', borderRadius: radius, padding: 8 }}>
                    {a.category && <div style={{ color: 'var(--a)', fontSize: 9, fontWeight: 700, marginBottom: 2 }}>{a.category}</div>}
                    <div style={{ color: 'var(--tx)', fontWeight: 600, fontSize: 10, lineHeight: 1.4 }}>{a.title}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* List */}
          {l.articlesLayout === 'list' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {preview.articles.slice(0, 3).map((a, i) => (
                <div key={i} style={{ background: 'var(--sf)', border: '1px solid var(--bd)', borderRadius: radius, padding: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 52, height: 36, background: `linear-gradient(135deg, ${c.primary ?? '#1a2f4a'}28, ${c.accent ?? '#b8973a'}28)`, borderRadius: 4, flexShrink: 0 }} />
                  <div>
                    {a.category && <div style={{ color: 'var(--a)', fontSize: 9, fontWeight: 700, marginBottom: 1 }}>{a.category}</div>}
                    <div style={{ color: 'var(--tx)', fontWeight: 600, fontSize: 10 }}>{a.title}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* News */}
      {(preview.news?.length ?? 0) > 0 && (
        <div style={{ background: 'var(--sf)', borderTop: '1px solid var(--bd)', padding: '14px 20px' }}>
          <div style={{ color: 'var(--tx)', fontFamily: 'var(--hf)', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>最新消息</div>
          {l.newsLayout === 'card' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
              {preview.news.slice(0, 3).map((n, i) => (
                <div key={i} style={{ background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: radius, padding: '8px 10px' }}>
                  <div style={{ color: 'var(--tx)', fontWeight: 600, fontSize: 10, lineHeight: 1.4 }}>{n.title}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {preview.news.slice(0, 3).map((n, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', paddingBottom: 5, borderBottom: `1px solid var(--bd)` }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--a)', marginTop: 3, flexShrink: 0, display: 'block' }} />
                  <span style={{ color: 'var(--tx)', fontSize: 10, lineHeight: 1.4 }}>{n.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Marquee strip */}
      {(preview.marquee?.length ?? 0) > 0 && (
        <div style={{ background: 'var(--p)', padding: '7px 20px', display: 'flex', gap: 20, overflow: 'hidden' }}>
          {preview.marquee.slice(0, 4).map((m, i) => (
            <span key={i} style={{ color: 'rgba(255,255,255,0.85)', fontSize: 10, whiteSpace: 'nowrap' }}>{m}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ background: 'var(--p)', padding: '10px 20px', borderTop: `1px solid rgba(255,255,255,0.1)` }}>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9, textAlign: 'center' }}>© {siteName} · All rights reserved</div>
      </div>
    </div>
  );
}

export default function GeneratePage({ params }: { params: { siteId: string } }) {
  const [tab, setTab] = useState<Tab>('quickbuild');

  // ── 一鍵建站 ──
  const [buildPrompt, setBuildPrompt] = useState('');
  const [building, setBuilding] = useState(false);
  const [applying, setApplying] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [buildResult, setBuildResult] = useState<{ articles: number; news: number; marquee: number } | null>(null);
  const [buildError, setBuildError] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [siteName, setSiteName] = useState('');
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    fetch(`/api/sites/${params.siteId}`)
      .then(r => r.json())
      .then(site => {
        const url = site?.seo_config?.vercel_url;
        if (url) setSiteUrl(url);
        if (site?.name) setSiteName(site.name);
      })
      .catch(() => {});
  }, [params.siteId]);

  async function handlePreview() {
    if (!buildPrompt.trim() || building) return;
    setBuilding(true);
    setPreview(null);
    setBuildResult(null);
    setBuildError('');
    try {
      const res = await fetch(`/api/sites/${params.siteId}/generate-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: buildPrompt, mode: 'preview' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '生成失敗');
      setPreview(data.preview);
    } catch (e) {
      setBuildError(e instanceof Error ? e.message : '生成失敗，請再試一次');
    } finally {
      setBuilding(false);
    }
  }

  async function handleApply() {
    if (!preview || applying) return;
    setApplying(true);
    setBuildError('');
    try {
      const res = await fetch(`/api/sites/${params.siteId}/generate-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'apply', prompt: buildPrompt, generated: preview }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '套用失敗');
      setBuildResult(data.summary);
      setPreview(null);
      setTimeout(() => setIframeKey(k => k + 1), 2500);
    } catch (e) {
      setBuildError(e instanceof Error ? e.message : '套用失敗，請再試一次');
    } finally {
      setApplying(false);
    }
  }

  // ── AI 對話 ──
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [readyToGenerate, setReadyToGenerate] = useState(false);
  const [interviewBuildPrompt, setInterviewBuildPrompt] = useState('');

  async function sendInterview(text?: string) {
    const content = (text ?? input).trim();
    // First call (auto-start): empty content is ok
    if (!content && interviewStarted) return;
    if (chatLoading) return;

    const userMsg: Message = { role: 'user', content: content || '開始' };
    const next: Message[] = content ? [...messages, userMsg] : [];
    if (content) setMessages(next);
    setInput('');
    setChatLoading(true);
    if (!interviewStarted) setInterviewStarted(true);

    try {
      const res = await fetch('/api/content/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, siteName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '失敗');
      setMessages((m) => [...(content ? m : []), { role: 'assistant', content: data.reply }]);
      if (data.readyToGenerate) {
        setReadyToGenerate(true);
        setInterviewBuildPrompt(data.buildPrompt ?? '');
      }
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: `錯誤：${e instanceof Error ? e.message : '請稍後再試'}` }]);
    } finally {
      setChatLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }

  async function handleInterviewGenerate() {
    if (!interviewBuildPrompt || building) return;
    setBuildPrompt(interviewBuildPrompt);
    setBuilding(true);
    setPreview(null);
    setBuildResult(null);
    setBuildError('');
    try {
      const res = await fetch(`/api/sites/${params.siteId}/generate-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: interviewBuildPrompt, mode: 'preview' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '生成失敗');
      setPreview(data.preview);
      setTab('quickbuild'); // switch to quickbuild tab to show visual preview
    } catch (e) {
      setBuildError(e instanceof Error ? e.message : '生成失敗，請再試一次');
    } finally {
      setBuilding(false);
    }
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-slate-900">AI 內容生成</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 w-fit">
        <button
          onClick={() => setTab('quickbuild')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'quickbuild' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          ✦ 一鍵建站
        </button>
        <button
          onClick={() => setTab('chat')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'chat' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          AI 對話
        </button>
      </div>

      {/* 一鍵建站 */}
      {tab === 'quickbuild' && (
        <div className="flex flex-col gap-5">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-blue-900 mb-1">一鍵生成完整網站內容</h2>
            <p className="text-xs text-blue-600 mb-4">
              描述你的網站，AI 生成預覽後再決定是否套用。
            </p>
            <textarea
              value={buildPrompt}
              onChange={(e) => setBuildPrompt(e.target.value)}
              placeholder={`例：\n我是台北的律師事務所，主要服務企業法律顧問、勞資糾紛、不動產交易。\n目標客戶是中小企業主和個人。風格要專業沉穩，深藍色系。`}
              rows={4}
              className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
            <button
              onClick={handlePreview}
              disabled={!buildPrompt.trim() || building}
              className="mt-3 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {building ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  AI 生成中，約需 30-60 秒…
                </span>
              ) : '✦ 生成預覽'}
            </button>
          </div>

          {buildError && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{buildError}</div>
          )}

          {/* Preview card */}
          {preview && (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              {/* Visual preview */}
              <VisualPreview preview={preview} siteName={siteName} />

              {/* Action buttons */}
              <div className="flex gap-3 p-4 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {applying ? '套用中…' : '✓ 確認套用至網站'}
                </button>
                <button
                  onClick={() => { setPreview(null); }}
                  className="px-4 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  onClick={handlePreview}
                  disabled={building}
                  className="px-4 rounded-xl border border-blue-200 text-sm text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                >
                  重新生成
                </button>
              </div>
            </div>
          )}

          {/* Success */}
          {buildResult && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-green-50 border border-green-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 text-lg">✓</span>
                    <h3 className="font-semibold text-green-900">套用完成！</h3>
                  </div>
                  <button
                    onClick={() => { setBuildResult(null); setBuildPrompt(''); }}
                    className="text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 bg-white"
                  >
                    重新生成
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: '文章', value: buildResult.articles },
                    { label: '最新消息', value: buildResult.news },
                    { label: '跑馬燈', value: buildResult.marquee },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl bg-white border border-green-100 py-3">
                      <div className="text-2xl font-bold text-green-700">{s.value}</div>
                      <div className="text-xs text-green-600">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {siteUrl && (
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-red-400" />
                        <span className="w-3 h-3 rounded-full bg-yellow-400" />
                        <span className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <span className="text-xs text-slate-400 ml-1 font-mono truncate max-w-[240px]">{siteUrl}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIframeKey(k => k + 1)}
                        className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                        title="重新整理"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        重新整理
                      </button>
                      <a
                        href={siteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        開新分頁
                      </a>
                    </div>
                  </div>
                  <iframe
                    key={iframeKey}
                    src={siteUrl}
                    className="w-full"
                    style={{ height: 560, border: 'none' }}
                    title="網站預覽"
                  />
                </div>
              )}
            </div>
          )}

          <div className="text-xs text-slate-400 bg-slate-50 rounded-xl p-4">
            <strong className="text-slate-500">注意：</strong>套用後會覆蓋現有文章、消息和跑馬燈內容。
          </div>
        </div>
      )}

      {/* AI 對話 */}
      {tab === 'chat' && (
        <div className="flex flex-col flex-1" style={{ minHeight: 400 }}>
          <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-4 min-h-0" style={{ minHeight: 300 }}>
            {messages.length === 0 && chatLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 150, 300].map((d) => (
                      <span key={d} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.length === 0 && !chatLoading && !interviewStarted && (
              <div className="flex flex-col items-center justify-center flex-1 text-center py-12">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <span className="text-blue-600 text-xl">💬</span>
                </div>
                <p className="text-sm font-medium text-slate-700 mb-1">AI 顧問問答建站</p>
                <p className="text-xs text-slate-400 mb-6 max-w-xs">AI 會透過 6-8 個問題了解你的需求，再一鍵生成完整網站</p>
                <button
                  onClick={() => sendInterview()}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700"
                >
                  開始諮詢
                </button>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1 mr-2">AI</div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {chatLoading && messages.length > 0 && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1 mr-2">AI</div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 150, 300].map((d) => (
                      <span key={d} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {readyToGenerate && !chatLoading && (
              <div className="flex justify-center mt-2">
                <button
                  onClick={handleInterviewGenerate}
                  disabled={building}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
                >
                  {building ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      AI 生成中，約需 30-60 秒…
                    </>
                  ) : (
                    <>✦ 立即生成網站</>
                  )}
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {!readyToGenerate && (
            <div className="border-t border-slate-200 pt-4">
              <div className="flex gap-2 items-end bg-white border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendInterview(); } }}
                  placeholder="輸入你的回答…（Enter 送出）"
                  rows={1}
                  style={{ resize: 'none', maxHeight: 120 }}
                  className="flex-1 text-sm text-slate-800 placeholder-slate-400 focus:outline-none overflow-auto"
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = 'auto';
                    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
                  }}
                />
                <button
                  onClick={() => sendInterview()}
                  disabled={!input.trim() || chatLoading}
                  className="shrink-0 w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              {messages.length > 0 && (
                <p className="text-xs text-slate-400 mt-2 text-center">AI 顧問會逐步詢問建站需求，回答完畢後自動生成網站</p>
              )}
            </div>
          )}

          {readyToGenerate && (
            <div className="border-t border-slate-100 pt-3 text-center">
              <button
                onClick={() => {
                  setMessages([]);
                  setInterviewStarted(false);
                  setReadyToGenerate(false);
                  setInterviewBuildPrompt('');
                }}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                重新開始訪談
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
