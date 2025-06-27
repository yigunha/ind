// supabase.js – 브라우저에서 사용하는 공개 연결 (anon key 사용)

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://svlqqkfkmevcjssarpng.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2bHFxa2ZrbWV2Y2pzc2FycG5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NjE5MDUsImV4cCI6MjA2NjQzNzkwNX0.bB8oanmqsBtoL3H4xwczP6khaojvnu02VWmtm0xY_yM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
