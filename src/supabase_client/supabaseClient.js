import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qrngmexkpvxjvlhwzxih.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFybmdtZXhrcHZ4anZsaHd6eGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MDM0MzgsImV4cCI6MjA4Mzk3OTQzOH0.md3tS2sawJ_v5bP6WicZCAgJkk2b5tsy3y3ndsPG5to'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)