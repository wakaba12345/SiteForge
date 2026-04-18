'use client';

import { useEffect, useState } from 'react';

interface MarqueeItem {
  id: string;
  text: string;
  url: string | null;
  is_active: boolean;
  sort_order: number;
}

interface Draft { text: string; url: string; sort_order: number; }
const EMPTY_DRAFT: Draft = { text: '', url: '', sort_order: 0 };

export default function MarqueeClient() {
  const [items, setItems] = useState<MarqueeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(EMPTY_DRAFT);

  useEffect(() => {
    fetch('/api/admin/marquee')
      .then((r) => r.json())
      .then((data) => { setItems(data); setLoading(false); });
  }, []);

  async function addItem() {
    if (!draft.text.trim()) return;
    setAdding(true);
    const res = await fetch('/api/admin/marquee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...draft, url: draft.url || null, is_active: true }),
    });
    const item = await res.json();
    setItems((prev) => [...prev, item]);
    setDraft(EMPTY_DRAFT);
    setAdding(false);
  }

  async function toggleActive(item: MarqueeItem) {
    await fetch(`/api/admin/marquee/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !item.is_active }),
    });
    setItems((prev) => prev.map((m) => m.id === item.id ? { ...m, is_active: !m.is_active } : m));
  }

  function startEdit(item: MarqueeItem) {
    setEditId(item.id);
    setEditDraft({ text: item.text, url: item.url ?? '', sort_order: item.sort_order });
  }

  async function saveEdit(id: string) {
    await fetch(`/api/admin/marquee/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...editDraft, url: editDraft.url || null }),
    });
    setItems((prev) => prev.map((m) => m.id === id ? { ...m, ...editDraft, url: editDraft.url || null } : m));
    setEditId(null);
  }

  async function deleteItem(id: string, text: string) {
    if (!confirm(`確定刪除「${text}」？`)) return;
    await fetch(`/api/admin/marquee/${id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((m) => m.id !== id));
  }

  if (loading) return <div className="text-sm text-gray-400">載入中…</div>;

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div className="rounded border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">新增跑馬燈項目</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_200px_80px_auto]">
          <input
            type="text"
            value={draft.text}
            onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
            placeholder="跑馬燈文字"
            className="rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
          />
          <input
            type="url"
            value={draft.url}
            onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))}
            placeholder="連結（選填）"
            className="rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
          />
          <input
            type="number"
            value={draft.sort_order}
            onChange={(e) => setDraft((d) => ({ ...d, sort_order: Number(e.target.value) }))}
            placeholder="排序"
            className="rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
          />
          <button
            onClick={addItem}
            disabled={adding || !draft.text.trim()}
            className="rounded bg-[#c9a84c] px-4 py-2 text-sm font-medium text-white hover:bg-[#b8973f] disabled:opacity-50"
          >
            新增
          </button>
        </div>
      </div>

      {/* Items list */}
      <div className="overflow-x-auto rounded border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 w-12">啟用</th>
              <th className="px-4 py-3">文字</th>
              <th className="px-4 py-3">連結</th>
              <th className="px-4 py-3 w-16">排序</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">尚無跑馬燈項目</td></tr>
            )}
            {items.map((item) => (
              <tr key={item.id} className={`hover:bg-gray-50 ${!item.is_active ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleActive(item)}
                    className={`w-8 h-4 rounded-full transition-colors relative ${item.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                    title={item.is_active ? '停用' : '啟用'}
                  >
                    <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${item.is_active ? 'right-0.5' : 'left-0.5'}`} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  {editId === item.id ? (
                    <input
                      type="text"
                      value={editDraft.text}
                      onChange={(e) => setEditDraft((d) => ({ ...d, text: e.target.value }))}
                      className="w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
                    />
                  ) : (
                    <span className="text-gray-900">{item.text}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editId === item.id ? (
                    <input
                      type="url"
                      value={editDraft.url}
                      onChange={(e) => setEditDraft((d) => ({ ...d, url: e.target.value }))}
                      placeholder="連結（選填）"
                      className="w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
                    />
                  ) : (
                    item.url ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs truncate max-w-xs block">
                        {item.url}
                      </a>
                    ) : <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editId === item.id ? (
                    <input
                      type="number"
                      value={editDraft.sort_order}
                      onChange={(e) => setEditDraft((d) => ({ ...d, sort_order: Number(e.target.value) }))}
                      className="w-16 rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
                    />
                  ) : (
                    <span className="text-gray-500">{item.sort_order}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {editId === item.id ? (
                      <>
                        <button onClick={() => saveEdit(item.id)} className="text-green-600 font-medium hover:text-green-800">儲存</button>
                        <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-600">取消</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(item)} className="text-[#0d1f3c] hover:text-[#c9a84c] font-medium">編輯</button>
                        <button onClick={() => deleteItem(item.id, item.text)} className="text-red-400 hover:text-red-600">刪除</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
