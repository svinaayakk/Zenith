import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

const IS_SUPABASE_CONFIGURED =
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_ANON_KEY.startsWith('eyJ') &&
  supabase != null

/* ── Auth: magic-link / anonymous sign-in by display name ── */
export function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!IS_SUPABASE_CONFIGURED) {
      /* check for a locally-persisted session */
      try {
        const saved = localStorage.getItem('zenith_local_session')
        if (saved) setSession(JSON.parse(saved))
      } catch {}
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setLoading(false)
    }).catch(() => setLoading(false))
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => setSession(s),
    )
    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (displayName) => {
    if (!IS_SUPABASE_CONFIGURED) {
      const localSession = {
        user: {
          id: crypto.randomUUID(),
          user_metadata: { display_name: displayName },
        },
      }
      localStorage.setItem('zenith_local_session', JSON.stringify(localSession))
      setSession(localSession)
      return localSession
    }
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
    if (!IS_SUPABASE_CONFIGURED) {
      localStorage.removeItem('zenith_local_session')
      setSession(null)
      return
    }
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
    if (!IS_SUPABASE_CONFIGURED) {
      try {
        const saved = localStorage.getItem(`zenith_${table}_${userId}`)
        if (saved) setRows(JSON.parse(saved))
      } catch {}
      setReady(true)
      return
    }
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
      if (!IS_SUPABASE_CONFIGURED) {
        setRows((prev) => {
          const idx = prev.findIndex((r) => r.id === row.id)
          const next = idx >= 0 ? [...prev] : [...prev, row]
          if (idx >= 0) next[idx] = row
          localStorage.setItem(`zenith_${table}_${userId}`, JSON.stringify(next))
          return next
        })
        return row
      }
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
      if (!IS_SUPABASE_CONFIGURED) {
        setRows((prev) => {
          const next = prev.filter((r) => r.id !== id)
          localStorage.setItem(`zenith_${table}_${userId}`, JSON.stringify(next))
          return next
        })
        return
      }
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
    if (!IS_SUPABASE_CONFIGURED) {
      try {
        const saved = localStorage.getItem(`zenith_completion_${userId}`)
        if (saved) setLog(JSON.parse(saved))
      } catch {}
      return
    }
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
      setLog((prev) => {
        const next = { ...prev, [dateKey]: { done, total } }
        if (!IS_SUPABASE_CONFIGURED) {
          localStorage.setItem(`zenith_completion_${userId}`, JSON.stringify(next))
        }
        return next
      })
      if (IS_SUPABASE_CONFIGURED) {
        await supabase.from('completion_log').upsert(
          { user_id: userId, date_key: dateKey, done, total },
          { onConflict: 'user_id,date_key' },
        )
      }
    },
    [userId],
  )

  return { log, upsertDay }
}
