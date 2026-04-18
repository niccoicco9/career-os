function requireEnv(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required environment variable: ${key}`)
  return val
}

export const config = {
  groqApiKey: requireEnv('GROQ_API_KEY'),
  supabaseUrl: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
} as const
