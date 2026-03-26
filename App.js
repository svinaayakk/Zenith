import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import { SafeAreaView, ScrollView, Text, StyleSheet } from 'react-native'
import GoalList from './src/components/GoalList'
import HabitList from './src/components/HabitList'

const INITIAL_GOALS = [
  { id: 1, title: 'Finish Physics Assignment', deadline: '2026-04-01', completed: false },
  { id: 2, title: 'Submit Scholarship Essay', deadline: '2026-04-10', completed: false },
]

const INITIAL_HABITS = [
  { id: 1, title: 'Go to the Gym', frequency: 'daily', completed: false },
  { id: 2, title: 'Read 20 pages', frequency: 'daily', completed: false },
  { id: 3, title: 'Weekly Review', frequency: 'weekly', completed: false },
]

export default function App() {
  const [goals, setGoals] = useState(INITIAL_GOALS)
  const [habits, setHabits] = useState(INITIAL_HABITS)

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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Zenith</Text>
        <GoalList goals={goals} onAdd={addGoal} onToggle={toggleGoal} />
        <HabitList habits={habits} onAdd={addHabit} onToggle={toggleHabit} />
      </ScrollView>
      <StatusBar style="auto" />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 20, paddingTop: 50 },
  heading: { fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
})
