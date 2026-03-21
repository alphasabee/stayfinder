import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pwolaaagqfrwekwsdoud.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3b2xhYWFncWZyd2Vrd3Nkb3VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMDIwNjEsImV4cCI6MjA4OTU3ODA2MX0.xJ22Rs8JWQk_nNOTRL4W5kITYEKFJERFUtmqELM-I2o'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
