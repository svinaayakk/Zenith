import { useState } from 'react'
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native'
import TaskItem from './TaskItem'

function GoalList({ goals, onAdd, onToggle }) {
  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState('')

  const handleAdd = () => {
    if (!title.trim()) return
    onAdd({ title: title.trim(), deadline })
    setTitle('')
    setDeadline('')
  }

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Sprint Track (Goals)</Text>
      <TextInput
        style={styles.input}
        placeholder="New goal…"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Deadline (YYYY-MM-DD)"
        value={deadline}
        onChangeText={setDeadline}
      />
      <Pressable style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>Add Goal</Text>
      </Pressable>
      {goals.map((goal) => (
        <TaskItem key={goal.id} task={goal} onToggle={onToggle} />
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
  button: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
})

export default GoalList
