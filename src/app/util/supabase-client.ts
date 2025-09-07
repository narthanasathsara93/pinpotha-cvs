import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = 'https://oxqmtntumpladkytoryi.supabase.co';
export const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94cW10bnR1bXBsYWRreXRvcnlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMjM1NjksImV4cCI6MjA3Mjc5OTU2OX0.gc9OgzCQ5Y5fafRTGehC6IRB2gYCVwJbkY1UVL6FLS0';
export const supbaseStorageUrl = 'https://oxqmtntumpladkytoryi.storage.supabase.co/storage/v1/object/public/merit-images/';
export const bucketName = 'merit-images';
export const mertisTable = 'merits';
export const supabase = createClient(supabaseUrl, supabaseKey);