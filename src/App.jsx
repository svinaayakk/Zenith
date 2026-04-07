import { useState, useCallback, useEffect } from 'react'
import { StyleSheet, ActivityIndicator, View } from 'react-native'
import WelcomePage from './components/WelcomePage'
import HomePage from './components/HomePage'
import AnalyticsPage from './components/AnalyticsPage'
import RemindersPage from './components/RemindersPage'
import { useAuth, useGoals, useHabits, useReminders, useCompletionLog } from './lib/hooks'

function App() {
  const { session, loading: authLoading, displayName, signInWithGoogle, signUpWithEmail, signInWithEmail, signOut } = useAuth()
  const userId = session?.user?.id ?? null

  const { rows: goals, upsertRow: upsertGoal, deleteRow: deleteGoal } = useGoals(userId)
  const { rows: habits, upsertRow: upsertHabit, deleteRow: deleteHabit } = useHabits(userId)
  const { rows: reminders, upsertRow: upsertReminder, deleteRow: deleteReminder } = useReminders(userId)
  const { log: completionLog, upsertDay } = useCompletionLog(userId)

  const [activeTab, setActiveTab] = useState('focus')

  /* record today's completion snapshot whenever goals/habits change */
  useEffect(() => {
    if (!userId) return
    const total = goals.length + habits.length
    const done =
      goals.filter((g) => g.completed).length +
      habits.filter((h) => h.completed).length
    const key = new Date().toISOString().slice(0, 10)
    upsertDay(key, done, total)
  }, [goals, habits, userId])

  const handleTabChange = useCallback((key) => {
    setActiveTab(key)
  }, [])

  const addGoal = ({ title, deadline }) => {
    upsertGoal({ id: crypto.randomUUID(), title, deadline, completed: false })
  }

  const addHabit = ({ title, frequency }) => {
    upsertHabit({ id: crypto.randomUUID(), title, frequency, completed: false })
  }

  const toggleGoal = (id) => {
    const g = goals.find((x) => x.id === id)
    if (g) upsertGoal({ ...g, completed: !g.completed })
  }

  const toggleHabit = (id) => {
    const h = habits.find((x) => x.id === id)
    if (h) upsertHabit({ ...h, completed: !h.completed })
  }

  const addReminder = (r) => upsertReminder({ ...r, id: r.id ?? crypto.randomUUID() })
  const handleDeleteReminder = (id) => deleteReminder(id)

  /* bell count: reminders within 7 days or past due */
  const bellCount = reminders.filter((r) => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const target = new Date(r.date + 'T00:00:00')
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24))
    return diff <= 7
  }).length

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (e) {
      console.error('Google sign-in failed:', e)
    }
  }

  const handleEmailSignUp = async (email, password, name) => {
    await signUpWithEmail(email, password, name)
  }

  const handleEmailSignIn = async (email, password) => {
    await signInWithEmail(email, password)
  }

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F7' }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    )
  }

  return (
    <View style={appStyles.container}>
      {!session ? (
        <WelcomePage
          onGoogleSignIn={handleGoogleSignIn}
          onEmailSignUp={handleEmailSignUp}
          onEmailSignIn={handleEmailSignIn}
        />
      ) : (
        <>
          {activeTab === 'focus' && (
            <HomePage
              userName={displayName}
              goals={goals}
              habits={habits}
              onToggleGoal={toggleGoal}
              onToggleHabit={toggleHabit}
              onAddGoal={addGoal}
              onAddHabit={addHabit}
              onBack={signOut}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              bellCount={bellCount}
            />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsPage
              userName={displayName}
              goals={goals}
              habits={habits}
              completionLog={completionLog}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              bellCount={bellCount}
            />
          )}
          {activeTab === 'reminders' && (
            <RemindersPage
              userName={displayName}
              reminders={reminders}
              onAddReminder={addReminder}
              onDeleteReminder={handleDeleteReminder}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              bellCount={bellCount}
            />
          )}
        </>
      )}
    </View>
  )
}

const appStyles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
})

export default App
