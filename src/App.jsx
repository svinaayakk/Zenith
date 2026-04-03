import { useState, useRef, useCallback, useEffect } from 'react'
import { Animated, PanResponder, Dimensions, StyleSheet, ActivityIndicator, View } from 'react-native'
import WelcomePage from './components/WelcomePage'
import HomePage from './components/HomePage'
import AnalyticsPage from './components/AnalyticsPage'
import RemindersPage from './components/RemindersPage'
import { useAuth, useGoals, useHabits, useReminders, useCompletionLog } from './lib/hooks'

const { width: SCREEN_W } = Dimensions.get('window')
const TABS = ['focus', 'analytics', 'reminders']
const SWIPE_THRESHOLD = SCREEN_W * 0.25
const VELOCITY_THRESHOLD = 0.4

function App() {
  const { session, loading: authLoading, displayName, signIn, signOut } = useAuth()
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
  const translateX = useRef(new Animated.Value(0)).current
  const tabIndex = useRef(0)
  const mainOpacity = useRef(new Animated.Value(0)).current
  const mainScale = useRef(new Animated.Value(0.96)).current

  useEffect(() => {
    if (session) {
      Animated.parallel([
        Animated.timing(mainOpacity, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        }),
        Animated.spring(mainScale, {
          toValue: 1,
          tension: 50,
          friction: 9,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      mainOpacity.setValue(0)
      mainScale.setValue(0.96)
    }
  }, [session])

  const animateTo = useCallback(
    (index) => {
      tabIndex.current = index
      setActiveTab(TABS[index])
      Animated.spring(translateX, {
        toValue: -index * SCREEN_W,
        useNativeDriver: true,
        tension: 68,
        friction: 12,
      }).start()
    },
    [translateX],
  )

  const handleTabChange = useCallback(
    (key) => {
      const idx = TABS.indexOf(key)
      if (idx !== -1) animateTo(idx)
    },
    [animateTo],
  )

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10,
      onPanResponderMove: (_, { dx }) => {
        const base = -tabIndex.current * SCREEN_W
        const clamped = Math.max(
          -(TABS.length - 1) * SCREEN_W,
          Math.min(0, base + dx),
        )
        translateX.setValue(clamped)
      },
      onPanResponderRelease: (_, { dx, vx }) => {
        const cur = tabIndex.current
        if (dx < -SWIPE_THRESHOLD || vx < -VELOCITY_THRESHOLD) {
          animateTo(Math.min(cur + 1, TABS.length - 1))
        } else if (dx > SWIPE_THRESHOLD || vx > VELOCITY_THRESHOLD) {
          animateTo(Math.max(cur - 1, 0))
        } else {
          animateTo(cur)
        }
      },
    }),
  ).current

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

  const handleSignIn = async (name) => {
    await signIn(name)
  }

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#a8ab8e' }}>
        <ActivityIndicator size="large" color="#c8e64a" />
      </View>
    )
  }

  return (
    <>
      {!session ? (
        <WelcomePage onContinue={handleSignIn} />
      ) : (
        <Animated.View
          style={[
            appStyles.tray,
            {
              opacity: mainOpacity,
              transform: [{ translateX }, { scale: mainScale }],
            },
          ]}
          {...panResponder.panHandlers}
        >
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
          <AnalyticsPage
            userName={displayName}
            goals={goals}
            habits={habits}
            completionLog={completionLog}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            bellCount={bellCount}
          />
          <RemindersPage
            userName={displayName}
            reminders={reminders}
            onAddReminder={addReminder}
            onDeleteReminder={handleDeleteReminder}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            bellCount={bellCount}
          />
        </Animated.View>
      )}
    </>
  )
}

const appStyles = StyleSheet.create({
  tray: {
    flexDirection: 'row',
    width: SCREEN_W * TABS.length,
    flex: 1,
  },
})

export default App
