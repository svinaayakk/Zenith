import { useState } from 'react'
import GoalList from './components/GoalList'
import HabitList from './components/HabitList'

// Hardcoded seed data — Step 2 of Phase 1
const INITIAL_GOALS = [
  { id: 1, title: 'Finish Physics Assignment', deadline: '2026-04-01', completed: false },
  { id: 2, title: 'Submit Scholarship Essay', deadline: '2026-04-10', completed: false },
]

const INITIAL_HABITS = [
  { id: 1, title: 'Go to the Gym', frequency: 'daily', completed: false },
  { id: 2, title: 'Read 20 pages', frequency: 'daily', completed: false },
  { id: 3, title: 'Weekly Review', frequency: 'weekly', completed: false },
]

function App() {
  const [goals, setGoals] = useState(INITIAL_GOALS)
  const [habits, setHabits] = useState(INITIAL_HABITS)

  // --- Step 3: Add functions ---
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

  // --- Step 4: Toggle functions ---
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
      <h1>Zenith</h1>
      <GoalList goals={goals} onAdd={addGoal} onToggle={toggleGoal} />
      <HabitList habits={habits} onAdd={addHabit} onToggle={toggleHabit} />
    </>
  )
}

export default App
