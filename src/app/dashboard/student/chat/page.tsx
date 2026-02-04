'use client';

// 1. Correct Import for Next.js
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export const forceDynamic = 'force-dynamic';

// 2. Rename your main logic so it's a sub-component
function ChatInterface({ classId = '10A' }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const getMessages = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: true });
      
      if (data) setMessages(data);
    };

    getMessages();
    // ... rest of your real-time logic
  }, [classId]);

  return (
    <div className="p-4 border rounded-xl">
       {/* Your Chat UI */}
    </div>
  );
}

// 3. Export it with SSR disabled
// This tells Next.js: "Only load this on the user's screen, never on the build server."
export default dynamic(() => Promise.resolve(ChatInterface), {
  ssr: false,
});