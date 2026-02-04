import { supabase } from '@/lib/supabase';
const { data, error } = await supabase
  .from('messages')
  .select('*')
  .eq('class_id', '10A') // Manually set '10A' just to test the connection
  .order('created_at', { ascending: true });