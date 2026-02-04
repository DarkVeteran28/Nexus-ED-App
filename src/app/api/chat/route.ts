// src/app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic'; // Crucial for Vercel

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Your logic here (e.g., saving message to Supabase)
    const { data, error } = await supabase
      .from('messages')
      .insert([{ text: body.text, class_id: body.classId }]);

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}