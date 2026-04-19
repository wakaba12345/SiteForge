'use client';

import { useRef, useState } from 'react';

interface Message { role: 'user' | 'assistant'; content: string; }

const STARTER_PROMPTS = [
  '幫我生成「為什麼選擇我們」的文章內容',
  '幫我寫3則最新消息',
  '生成跑馬燈滾動文字（5則）',
  '幫我寫 Hero 區塊的標題和副標題',
];

type Tab = 'quickbuild' | 'chat';

interface PreviewData {
  layout?: { heroLayout?: string; articlesLayout?: string; newsLayout?: string };
  theme: any;
  hero: any;
  articles: Array<{ title: string; category?: string }>;
  news: Array<{ title: string }>;
  marquee: string[];
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

  async function sendChat(text?: string) {
    const content = (text ?? input).trim();
    if (!content || chatLoading) return;
    const next: Message[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setChatLoading(true);
    try {
      const res = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, siteId: params.siteId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '失敗');
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: `錯誤：${e instanceof Error ? e.message : '請稍後再試'}` }]);
    } finally {
      setChatLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
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
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">生成預覽</h3>
                <span className="text-xs text-slate-400">確認後再套用至網站</span>
              </div>

              {/* Colors */}
              {preview.theme?.colors && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2">配色</p>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(preview.theme.colors).map(([key, val]) => (
                      <div key={key} className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 rounded-lg border border-slate-200 shadow-sm" style={{ background: val as string }} />
                        <span className="text-[10px] text-slate-400">{key}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    字型：{preview.theme.typography?.headingFont} / {preview.theme.typography?.bodyFont}
                  </p>
                </div>
              )}

              {/* Layout */}
              {preview.layout && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2">版型</p>
                  <div className="flex gap-2 flex-wrap text-xs">
                    {[
                      { label: 'Hero', value: preview.layout.heroLayout },
                      { label: '文章', value: preview.layout.articlesLayout },
                      { label: '消息', value: preview.layout.newsLayout },
                    ].map((item) => item.value && (
                      <span key={item.label} className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                        {item.label}：{item.value}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Hero */}
              {preview.hero && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Hero 區塊</p>
                  <p className="text-sm font-bold text-slate-800">{preview.hero.title}</p>
                  <p className="text-xs text-slate-500">{preview.hero.subtitle}</p>
                </div>
              )}

              {/* Articles */}
              {preview.articles?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2">文章（{preview.articles.length} 篇）</p>
                  <div className="space-y-1">
                    {preview.articles.map((a, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-700">{a.title}</span>
                        {a.category && <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{a.category}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* News */}
              {preview.news?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2">最新消息（{preview.news.length} 則）</p>
                  <div className="space-y-1">
                    {preview.news.map((n, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-700">{n.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Marquee */}
              {preview.marquee?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2">跑馬燈（{preview.marquee.length} 則）</p>
                  <div className="flex flex-wrap gap-2">
                    {preview.marquee.map((m, i) => (
                      <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{m}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2 border-t border-slate-100">
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
            <div className="rounded-2xl bg-green-50 border border-green-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-green-600 text-lg">✓</span>
                <h3 className="font-semibold text-green-900">套用完成！已更新至網站</h3>
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
          )}

          <div className="text-xs text-slate-400 bg-slate-50 rounded-xl p-4">
            <strong className="text-slate-500">注意：</strong>套用後會覆蓋現有文章、消息和跑馬燈內容。
          </div>
        </div>
      )}

      {/* AI 對話 */}
      {tab === 'chat' && (
        <div className="flex flex-col flex-1" style={{ minHeight: 400 }}>
          <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-4 min-h-0" style={{ minHeight: 300 }}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center py-12">
                <p className="text-sm font-medium text-slate-700 mb-1">針對特定區塊追加或修改內容</p>
                <p className="text-xs text-slate-400 mb-6">一鍵建站後，用對話微調個別區塊</p>
                <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                  {STARTER_PROMPTS.map((p) => (
                    <button key={p} onClick={() => sendChat(p)}
                      className="text-xs text-left px-3 py-2 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-slate-600">
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`relative group max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                  }`}>
                    {msg.content}
                    {msg.role === 'assistant' && (
                      <button onClick={() => navigator.clipboard.writeText(msg.content)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded px-1.5 py-0.5">
                        複製
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
            {chatLoading && (
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
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-slate-200 pt-4">
            <div className="flex gap-2 items-end bg-white border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                placeholder="描述你想要的內容…（Enter 送出）"
                rows={1}
                style={{ resize: 'none', maxHeight: 120 }}
                className="flex-1 text-sm text-slate-800 placeholder-slate-400 focus:outline-none overflow-auto"
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = 'auto';
                  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
                }}
              />
              <button onClick={() => sendChat()} disabled={!input.trim() || chatLoading}
                className="shrink-0 w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
