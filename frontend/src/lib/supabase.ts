import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vspveivudezvqvpuucxd.supabase.co'

const supabaseAnonKey = 'sb_publishable_BrkgnK_ym7TwhnQoKEktoQ_ISCwp3mC'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)