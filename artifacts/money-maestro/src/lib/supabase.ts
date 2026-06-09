import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xrchfqafpqfvjdqbibfw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyY2hmcWFmcHFmdmpkcWJpYmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MTI3NTgsImV4cCI6MjA5NjQ4ODc1OH0.SleUjndCJ0SWT1n7UjGFe7TWGnAzRlx0t5wB-XlBP6Y';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
