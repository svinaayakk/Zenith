import { useState } from 'react'
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native'
import TaskItem from './TaskItem'

const FREQUENCIES = ['daily', 'weekly']

function HabitList({ habits, onAdd, onToggle }) {
  const [title, setTitle] = useState('')
  const [frequency, setFrequency] = useState('daily')

  const handleAdd = () => {
    if (!title.trim()) return
    onAdd({ title: title.trim(), frequency })
    setTitle('')
    setFrequency('daily')
  }

  const cycleFrequency = () => {
    setFrequency((prev) => (prev === 'daily' ? 'weekly' : 'daily'))
  }

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Consistency Track (Habits)</Text>
      <TextInput
        style={styles.input}
        placeholder="New habit…"
        value={title}
        onChangeText={setTitle}
      />
      <Pressable style={styles.frequencyPicker} onPress={cycleFrequency}>
        <Text style={styles.frequencyText}>{frequency}</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>Add Habit</Text>
      </Pressable>
      {habits.map((habit) => (
        <TaskItem key={habit.id} task={habit} onToggle={onToggle} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  section: { marginBottom: 30 },
  heading: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    fontSize: 16,
  },
  frequencyPicker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  frequencyText: { fontSize: 16, textTransform: 'capitalize' },
  button: {
    backgroundColor: '#2196f3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
})

export default HabitList
