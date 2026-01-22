'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function NoteForm() {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const { error } = await supabase
      .from('notes')
      .insert({ content });

    if (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Error saving note: ' + error.message });
    } else {
      setContent('');
      setMessage({ type: 'success', text: 'Note saved successfully!' });
    }

    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Write something"
          className="w-full px-4 py-2 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400"
          disabled={isSubmitting}
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting || !content.trim()}
        className="w-full py-2 px-6 rounded-lg font-medium tracking-wider text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#90EE90' }}
      >
        {isSubmitting ? 'Saving...' : 'Save'}
      </button>
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}
    </form>
  );
}
