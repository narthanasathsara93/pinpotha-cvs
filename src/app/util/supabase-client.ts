import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exhpdkktrnbduubqjyso.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4aHBka2t0cm5iZHV1YnFqeXNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTY3OTksImV4cCI6MjA2OTI5Mjc5OX0.dUhVXQZMMaVL8EDZjtRBt8RT8iy9NKlKEWx8VDVDEZU';
export const bucketName = 'merit-images';
export const supabase = createClient(supabaseUrl, supabaseKey);