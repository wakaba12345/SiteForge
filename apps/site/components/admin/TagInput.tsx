'use client';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ value, onChange }: TagInputProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const tag = e.currentTarget.value.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    e.currentTarget.value = '';
  }

  function remove(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-[#0d1f3c] px-3 py-1 text-xs text-white"
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              className="ml-1 text-white/60 hover:text-white"
            >
              &times;
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        onKeyDown={handleKeyDown}
        placeholder="輸入關鍵字後按 Enter"
        className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
      />
    </div>
  );
}
