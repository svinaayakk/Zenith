import { useState, useRef, useCallback, useEffect } from 'react'
import { Animated, PanResponder, Dimensions, StyleSheet } from 'react-native'
import WelcomePage from './components/WelcomePage'
import HomePage from './components/HomePage'
import AnalyticsPage from './components/AnalyticsPage'

const { width: SCREEN_W } = Dimensions.get('window')
const TABS = ['focus', 'analytics']
const SWIPE_THRESHOLD = SCREEN_W * 0.25
const VELOCITY_THRESHOLD = 0.4

function App() {
  const [userName, setUserName] = useState(null)
  const [goals, setGoals] = useState([])
  const [habits, setHabits] = useState([])
  const [activeTab, setActiveTab] = useState('focus')
  const translateX = useRef(new Animated.Value(0)).current
  const tabIndex = useRef(0)
  const mainOpacity = useRef(new Animated.Value(0)).current
  const mainScale = useRef(new Animated.Value(0.96)).current

  useEffect(() => {
    if (userName) {
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
  }, [userName])

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
    setGoals((prev) => [
      ...prev,
      { id: Date.now(), title, deadline, completed: false },
    ])
  }

  const addHabit = ({ title, frequency }) => {
    setHabits((prev) => [
      ...prev,
      { id: Date.now(), title, frequency, completed: false },
    ])
  }

  const toggleGoal = (id) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
    )
  }

  const toggleHabit = (id) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h))
    )
  }

  return (
    <>
      {!userName ? (
        <WelcomePage onContinue={setUserName} />
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
            userName={userName}
            goals={goals}
            habits={habits}
            onToggleGoal={toggleGoal}
            onToggleHabit={toggleHabit}
            onAddGoal={addGoal}
            onAddHabit={addHabit}
            onBack={() => setUserName(null)}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
          <AnalyticsPage
            userName={userName}
            goals={goals}
            habits={habits}
            activeTab={activeTab}
            onTabChange={handleTabChange}
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
