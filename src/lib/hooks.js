import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

/* ── Auth: magic-link / anonymous sign-in by display name ── */
export function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => setSession(s),
    )
    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (displayName) => {
    /* anonymous sign-in: create a user with a random email + password */
    const id = crypto.randomUUID()
    const email = `${id}@zenith.local`
    const password = id
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
    if (error) throw error
    return data
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const displayName = session?.user?.user_metadata?.display_name ?? null

  return { session, loading, displayName, signIn, signOut }
}

/* ── Generic table sync ── */
function useSupabaseTable(table, userId) {
  const [rows, setRows] = useState([])
  const [ready, setReady] = useState(false)

  /* initial fetch */
  useEffect(() => {
    if (!userId) return
    supabase
      .from(table)
      .select('*')
      .eq('user_id', userId)
      .then(({ data }) => {
        setRows(data ?? [])
        setReady(true)
      })
  }, [table, userId])

  const upsertRow = useCallback(
    async (row) => {
      const payload = { ...row, user_id: userId }
      const { data } = await supabase
        .from(table)
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single()
      setRows((prev) => {
        const idx = prev.findIndex((r) => r.id === data.id)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = data
          return next
        }
        return [...prev, data]
      })
      return data
    },
    [table, userId],
  )

  const deleteRow = useCallback(
    async (id) => {
      await supabase.from(table).delete().eq('id', id)
      setRows((prev) => prev.filter((r) => r.id !== id))
    },
    [table, userId],
  )

  return { rows, setRows, ready, upsertRow, deleteRow }
}

export function useGoals(userId) {
  return useSupabaseTable('goals', userId)
}

export function useHabits(userId) {
  return useSupabaseTable('habits', userId)
}

export function useReminders(userId) {
  return useSupabaseTable('reminders', userId)
}

export function useCompletionLog(userId) {
  const [log, setLog] = useState({})

  useEffect(() => {
    if (!userId) return
    supabase
      .from('completion_log')
      .select('*')
      .eq('user_id', userId)
      .then(({ data }) => {
        const map = {}
        ;(data ?? []).forEach((r) => {
          map[r.date_key] = { done: r.done, total: r.total }
        })
        setLog(map)
      })
  }, [userId])

  const upsertDay = useCallback(
    async (dateKey, done, total) => {
      setLog((prev) => ({ ...prev, [dateKey]: { done, total } }))
      await supabase.from('completion_log').upsert(
        { user_id: userId, date_key: dateKey, done, total },
        { onConflict: 'user_id,date_key' },
      )
    },
    [userId],
  )

  return { log, upsertDay }
}
