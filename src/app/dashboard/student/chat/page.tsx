'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function RealTimeChat({ classId = '10A' }) {
  // 1. Protection: Check if we are in the browser
  const [isClient, setIsClient] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');

  // 2. Only allow the component to fully "activate" after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return; // Wait for the browser

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };

    fetchMessages();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, 
      (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [classId, isClient]);

  // 3. Render a placeholder on the server to prevent the 'useState of null' crash
  if (!isClient) {
    return <div className="p-4 h-[500px] bg-slate-50 animate-pulse rounded-lg">Loading chat...</div>;
  }

  return (
    <div className="p-4 flex flex-col h-[500px] border rounded-lg">
      {/* ... your existing Chat JSX ... */}
    </div>
  );
}