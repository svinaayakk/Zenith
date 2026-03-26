import { View, Text, Pressable, StyleSheet } from 'react-native'

function TaskItem({ task, onToggle }) {
  return (
    <Pressable style={styles.row} onPress={() => onToggle(task.id)}>
      <View style={[styles.checkbox, task.completed && styles.checked]}>
        {task.completed && <Text style={styles.tick}>✓</Text>}
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, task.completed && styles.strikethrough]}>
          {task.title}
        </Text>
        {task.deadline && (
          <Text style={styles.meta}>Due {task.deadline}</Text>
        )}
        {task.frequency && (
          <Text style={styles.meta}>{task.frequency}</Text>
        )}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#888',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checked: { backgroundColor: '#4caf50', borderColor: '#4caf50' },
  tick: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  info: { flex: 1 },
  title: { fontSize: 16 },
  strikethrough: { textDecorationLine: 'line-through', color: '#999' },
  meta: { fontSize: 12, color: '#888', marginTop: 2 },
})

export default TaskItem
