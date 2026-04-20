'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { useState, useCallback, useRef, useEffect } from 'react';

function highlightHtml(code: string): string {
  return code.replace(
    /(<\/?)([\w-]+)((?:\s+[\w-]+(?:="[^"]*")?)*)(\/?>)/g,
    (_match, open: string, tag: string, attrs: string, close: string) => {
      const coloredAttrs = attrs.replace(
        /([\w-]+)(="[^"]*")?/g,
        (_m: string, name: string, val: string) =>
          `<span style="color:#986801">${name}</span>${val ? `<span style="color:#50a14f">${val}</span>` : ''}`,
      );
      return `<span style="color:#a0a0a0">${open}</span><span style="color:#e45649">${tag}</span>${coloredAttrs}<span style="color:#a0a0a0">${close}</span>`;
    },
  );
}

function formatHtml(html: string): string {
  const tags = html.replace(/></g, '>\n<');
  const lines = tags.split('\n');
  let indent = 0;
  const result: string[] = [];
  const selfClosing = /^<(img|br|hr|input|meta|link)\b/i;
  const closing = /^<\//;
  const opening = /^<[a-z]/i;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (closing.test(line)) indent = Math.max(0, indent - 1);
    result.push('  '.repeat(indent) + line);
    if (opening.test(line) && !selfClosing.test(line) && !closing.test(line) && !line.endsWith('/>')) {
      indent++;
    }
  }
  return result.join('\n');
}

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export default function RichEditor({ value, onChange }: RichEditorProps) {
  const [tab, setTab] = useState<'visual' | 'html'>('visual');
  const [codeValue, setCodeValue] = useState(() => formatHtml(value));
  const codeRef = useRef(value);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { target: '_blank' } }),
      Underline,
      Placeholder.configure({ placeholder: '開始撰寫文章內容...' }),
    ],
    content: value || '<p></p>',
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      codeRef.current = html;
      setCodeValue(formatHtml(html));
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'editor-content focus:outline-none min-h-[450px] p-4',
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || '<p></p>', { emitUpdate: false });
      const formatted = formatHtml(value || '');
      codeRef.current = value || '';
      setCodeValue(formatted);
    }
  }, [editor, value]);

  const handleCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      codeRef.current = e.target.value;
      setCodeValue(e.target.value);
    },
    [],
  );

  const switchToVisual = useCallback(() => {
    if (editor) {
      editor.commands.setContent(codeRef.current, { emitUpdate: false });
      onChange(codeRef.current);
    }
    setTab('visual');
  }, [editor, onChange]);

  const switchToHtml = useCallback(() => {
    if (editor) setCodeValue(formatHtml(editor.getHTML()));
    setTab('html');
  }, [editor]);

  const handleCodeBlur = useCallback(() => {
    if (editor) {
      editor.commands.setContent(codeRef.current, { emitUpdate: false });
      onChange(codeRef.current);
    }
  }, [editor, onChange]);

  async function uploadAndInsertImage(file: File) {
    if (!editor) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (res.ok) {
        const { url } = await res.json();
        editor.chain().focus().setImage({ src: url }).run();
      }
    } finally {
      setUploading(false);
    }
  }

  function addImage() {
    const choice = window.confirm('確定要上傳圖片嗎？\n\n「確定」= 從電腦上傳，「取消」= 輸入網址');
    if (choice) {
      fileInputRef.current?.click();
    } else {
      const url = window.prompt('輸入圖片網址：');
      if (url && editor) editor.chain().focus().setImage({ src: url }).run();
    }
  }

  function addLink() {
    const url = window.prompt('輸入連結網址：');
    if (url && editor) editor.chain().focus().setLink({ href: url }).run();
  }

  if (!editor) return <div className="rounded border p-4 text-gray-400">載入編輯器中...</div>;

  const Btn = ({
    onClick,
    active,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`rounded px-2 py-1 text-xs ${
        active ? 'bg-[#0d1f3c] text-white' : 'text-gray-600 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="rounded border">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b bg-gray-50 px-2 py-1.5">
        <Btn
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={editor.isActive('paragraph') && !editor.isActive('heading')}
        >
          內文
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })}>H1</Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>H2</Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>H3</Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} active={editor.isActive('heading', { level: 4 })}>H4</Btn>

        <span className="mx-1 text-gray-300">|</span>

        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}><strong>B</strong></Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}><em>I</em></Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}><span className="underline">U</span></Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}><span className="line-through">S</span></Btn>

        <span className="mx-1 text-gray-300">|</span>

        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>項目</Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>編號</Btn>
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>引用</Btn>
        <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')}>代碼</Btn>

        <span className="mx-1 text-gray-300">|</span>

        <Btn onClick={addLink} active={editor.isActive('link')}>連結</Btn>
        <Btn onClick={addImage}>{uploading ? '上傳中…' : '圖片'}</Btn>

        <span className="mx-1 text-gray-300">|</span>

        <Btn onClick={() => editor.chain().focus().undo().run()}>復原</Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()}>重做</Btn>

        <div className="ml-auto flex gap-1 text-xs">
          <button
            type="button"
            onClick={switchToVisual}
            className={`rounded px-2 py-1 ${tab === 'visual' ? 'bg-white text-[#0d1f3c] shadow-sm font-medium' : 'text-gray-400 hover:text-gray-600'}`}
          >
            所見即所得
          </button>
          <button
            type="button"
            onClick={switchToHtml}
            className={`rounded px-2 py-1 ${tab === 'html' ? 'bg-white text-[#0d1f3c] shadow-sm font-medium' : 'text-gray-400 hover:text-gray-600'}`}
          >
            HTML
          </button>
        </div>
      </div>

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) uploadAndInsertImage(f);
          e.target.value = '';
        }}
      />

      {/* Content */}
      {tab === 'visual' ? (
        <div className="bg-white">
          <EditorContent editor={editor} />
        </div>
      ) : (
        <div className="relative min-h-[450px] bg-white">
          <pre
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: highlightHtml(codeValue) }}
          />
          <textarea
            value={codeValue}
            onChange={handleCodeChange}
            onBlur={handleCodeBlur}
            spellCheck={false}
            className="relative min-h-[450px] w-full resize-none bg-transparent p-4 font-mono text-sm leading-relaxed text-transparent caret-gray-700 focus:outline-none"
            placeholder="<p>HTML code here...</p>"
          />
        </div>
      )}
    </div>
  );
}
