import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from './supabase/server'

export const getApiUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

export const requireUser = cache(async () => {
  const user = await getApiUser()
  if (!user) redirect('/login')
  return user
})
