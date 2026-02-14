"use client";

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Youtube from '@tiptap/extension-youtube';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo, 
  Link as LinkIcon, 
  Image as ImageIcon,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Code,
  Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function TiptapEditor({ content, onChange, placeholder = 'دەست بکە بە نووسین...' }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
        Image,
        Youtube.configure({
          controls: true,
          nocookie: true,
          modestBranding: true,
        }),
        TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] p-8 bg-white rounded-b-3xl text-right font-medium leading-relaxed',
        dir: 'rtl',
      },
    },
    immediatelyRender: false,
  });

  // Update editor content when content prop changes (e.g. when editing)
  useEffect(() => {
    if (editor && content !== undefined && content !== null && content !== editor.getHTML()) {
      // Small timeout to ensure Tiptap is ready for the new content
      const timer = setTimeout(() => {
        editor.commands.setContent(content);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('URL-ی وێنەکە بنووسە:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

    const setLink = () => {
      const url = window.prompt('بەستەرەکە بنووسە:');
      if (url) {
        editor.chain().focus().setLink({ href: url }).run();
      }
    };

    const addVideo = () => {
      const url = window.prompt('بەستەری ڤیدیۆی یوتوب بنووسە:');
      if (url) {
        editor.commands.setYoutubeVideo({ src: url });
      }
    };

  return (
    <div className="border border-neutral-100 rounded-[2.5rem] overflow-hidden shadow-sm bg-neutral-50 p-1">
      <div className="flex flex-wrap items-center gap-1 p-3 bg-white rounded-t-[2.2rem] border-b border-neutral-100 sticky top-0 z-10 shadow-sm">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-10 w-10 rounded-xl transition-all ${editor.isActive('bold') ? 'bg-blue-50 text-blue-600 shadow-inner' : 'text-neutral-400 hover:bg-neutral-50'}`}
        >
          <Bold size={18} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-10 w-10 rounded-xl transition-all ${editor.isActive('italic') ? 'bg-purple-50 text-purple-600 shadow-inner' : 'text-neutral-400 hover:bg-neutral-50'}`}
        >
          <Italic size={18} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`h-10 w-10 rounded-xl transition-all ${editor.isActive('underline') ? 'bg-indigo-50 text-indigo-600 shadow-inner' : 'text-neutral-400 hover:bg-neutral-50'}`}
        >
          <Type size={18} />
        </Button>

        <div className="w-px h-6 bg-neutral-100 mx-1"></div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`h-10 w-10 rounded-xl transition-all ${editor.isActive('heading', { level: 1 }) ? 'bg-orange-50 text-orange-600 shadow-inner' : 'text-neutral-400 hover:bg-neutral-50'}`}
        >
          <Heading1 size={18} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`h-10 w-10 rounded-xl transition-all ${editor.isActive('heading', { level: 2 }) ? 'bg-amber-50 text-amber-600 shadow-inner' : 'text-neutral-400 hover:bg-neutral-50'}`}
        >
          <Heading2 size={18} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`h-10 w-10 rounded-xl transition-all ${editor.isActive('heading', { level: 3 }) ? 'bg-yellow-50 text-yellow-600 shadow-inner' : 'text-neutral-400 hover:bg-neutral-50'}`}
        >
          <Heading3 size={18} />
        </Button>

        <div className="w-px h-6 bg-neutral-100 mx-1"></div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`h-10 w-10 rounded-xl transition-all ${editor.isActive({ textAlign: 'right' }) ? 'bg-neutral-100 text-neutral-800' : 'text-neutral-400 hover:bg-neutral-50'}`}
        >
          <AlignRight size={18} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`h-10 w-10 rounded-xl transition-all ${editor.isActive({ textAlign: 'center' }) ? 'bg-neutral-100 text-neutral-800' : 'text-neutral-400 hover:bg-neutral-50'}`}
        >
          <AlignCenter size={18} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`h-10 w-10 rounded-xl transition-all ${editor.isActive({ textAlign: 'left' }) ? 'bg-neutral-100 text-neutral-800' : 'text-neutral-400 hover:bg-neutral-50'}`}
        >
          <AlignLeft size={18} />
        </Button>

        <div className="w-px h-6 bg-neutral-100 mx-1"></div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`h-10 w-10 rounded-xl transition-all ${editor.isActive('bulletList') ? 'bg-emerald-50 text-emerald-600 shadow-inner' : 'text-neutral-400 hover:bg-neutral-50'}`}
        >
          <List size={18} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`h-10 w-10 rounded-xl transition-all ${editor.isActive('orderedList') ? 'bg-emerald-50 text-emerald-600 shadow-inner' : 'text-neutral-400 hover:bg-neutral-50'}`}
        >
          <ListOrdered size={18} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`h-10 w-10 rounded-xl transition-all ${editor.isActive('blockquote') ? 'bg-cyan-50 text-cyan-600 shadow-inner' : 'text-neutral-400 hover:bg-neutral-50'}`}
        >
          <Quote size={18} />
        </Button>

        <div className="w-px h-6 bg-neutral-100 mx-1"></div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={setLink}
          className={`h-10 w-10 rounded-xl transition-all ${editor.isActive('link') ? 'bg-indigo-50 text-indigo-600 shadow-inner' : 'text-neutral-400 hover:bg-neutral-50'}`}
        >
          <LinkIcon size={18} />
        </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={addImage}
            className="h-10 w-10 rounded-xl transition-all text-neutral-400 hover:bg-rose-50 hover:text-rose-600"
          >
            <ImageIcon size={18} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={addVideo}
            className="h-10 w-10 rounded-xl transition-all text-neutral-400 hover:bg-red-50 hover:text-red-600"
            title="ڤیدیۆی یوتوب"
          >
            <Video size={18} />
          </Button>

        <div className="mr-auto flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-10 w-10 rounded-xl text-neutral-300 hover:text-neutral-500 hover:bg-neutral-50"
          >
            <Undo size={18} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-10 w-10 rounded-xl text-neutral-300 hover:text-neutral-500 hover:bg-neutral-50"
          >
            <Redo size={18} />
          </Button>
        </div>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
