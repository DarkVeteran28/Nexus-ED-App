'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function RealTimeChat({ classId = '10A' }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');

  // 1. Fetch existing messages and listen for new ones
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };

    fetchMessages();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, 
      (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [classId]);

  // 2. Send a new message
  const sendMessage = async () => {
    await supabase.from('messages').insert([{ 
        text, 
        class_id: classId, 
        sender_name: 'Student Name' // Replace with logged in user name
    }]);
    setText('');
  };

  return (
    <div className="p-4 flex flex-col h-[500px] border rounded-lg">
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {messages.map((m) => (
          <div key={m.id} className="p-2 bg-gray-100 rounded">
            <span className="font-bold text-xs">{m.sender_name}: </span>
            <p>{m.text}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)} className="border flex-1 p-2" placeholder="Type..." />
        <button onClick={sendMessage} className="bg-blue-600 text-white px-4 rounded">Send</button>
      </div>
    </div>
  );
}
// src/app/dashboard/student/chat/page.tsx (Inside your component)

const [messages, setMessages] = useState<any[]>([]);

useEffect(() => {
  const getMessages = async () => {
    // 1. Get the logged-in user from Supabase Auth
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // 2. Fetch the user's profile to get their class_id
      const { data: profile } = await supabase
        .from('profiles') // Assuming you have a profiles table
        .select('class_id')
        .eq('id', user.id)
        .single();

      if (profile?.class_id) {
        // 3. NOW filter messages by that specific class_id
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('class_id', profile.class_id)
          .order('created_at', { ascending: true });

        if (error) console.error("Error fetching messages:", error);
        else setMessages(data || []);
      }
    }
  };

  getMessages();
}, []);