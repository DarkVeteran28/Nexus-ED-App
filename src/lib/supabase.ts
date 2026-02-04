'use client';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ivrsccddjzwjgikoumdp.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2cnNjY2Rkanp3amdpa291bWRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNzQ3OTUsImV4cCI6MjA4NTc1MDc5NX0.keJ2qLnDxVoLcLI7zwRO66r4gsn9yG6bHjZOyk5vAuM";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Supabase keys are missing! Check your .env.local file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
// import { createClient } from '@supabase/supabase-js';

// // Fallback to empty strings or placeholders so the build doesn't crash
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);