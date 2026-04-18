'use client';

import { useEffect, useRef, useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STARTER_PROMPTS = [
  '幫我生成「為什麼選擇我們」的文章內容',
  '幫我寫3則最新消息',
  '生成跑馬燈滾動文字（5則）',
  '幫我寫 Hero 區塊的標題和副標題',
  '生成服務介紹文章',
  '幫我寫收費標準頁面內容',
];

export default function GeneratePage({ params }: { params: { siteId: string } }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, siteId: params.siteId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setMessages((m) => [...m, { role: 'assistant', content: `錯誤：${err.error ?? '請稍後再試'}` }]);
        return;
      }

      const data = await res.json();
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: '連線錯誤，請稍後再試。' }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">AI 內容生成</h1>
          <p className="text-xs text-slate-400 mt-0.5">描述你的網站，讓 AI 幫你生成文章、消息、跑馬燈等內容</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="text-xs text-slate-400 hover:text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5"
          >
            清空對話
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-4 min-h-0" style={{ minHeight: 300 }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-700 mb-1">告訴 AI 你的網站在做什麼</p>
            <p className="text-xs text-slate-400 mb-6">例如：我的網站是日本旅遊代辦服務，目標是台灣客戶，主要提供東京大阪自由行規劃...</p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-md">
              {STARTER_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="text-xs text-left px-3 py-2 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-slate-600"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`relative group max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                }`}
              >
                {msg.content}
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => copyText(msg.content)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded px-1.5 py-0.5"
                  >
                    複製
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-slate-200 pt-4">
        <div className="flex gap-2 items-end bg-white border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="描述你想要的內容，或直接問 AI…（Enter 送出，Shift+Enter 換行）"
            rows={1}
            style={{ resize: 'none', maxHeight: 160 }}
            className="flex-1 text-sm text-slate-800 placeholder-slate-400 focus:outline-none overflow-auto"
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = Math.min(el.scrollHeight, 160) + 'px';
            }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="shrink-0 w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">複製 AI 生成的內容後，前往各模組的後台填入</p>
      </div>
    </div>
  );
}
