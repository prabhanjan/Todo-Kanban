import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fyypkkqadafhlszuyvqr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5eXBra3FhZGFmaGxzenV5dnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTYwNjAsImV4cCI6MjA4MDQ5MjA2MH0.Q29RtIXlwqByTPh0HKjl_OYLfy8xoMdDN8MPEn84ups';

export const supabase = createClient(supabaseUrl, supabaseKey);