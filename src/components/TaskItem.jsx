import { View, Text, Pressable, StyleSheet } from 'react-native'

function TaskItem({ task, onToggle }) {
  return (
    <Pressable style={styles.row} onPress={() => onToggle(task.id)}>
      <View style={[styles.checkbox, task.completed && styles.checked]}>
        {task.completed && (
          <View style={styles.tickMark}>
            <View style={styles.tickShort} />
            <View style={styles.tickLong} />
          </View>
        )}
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
  tickMark: { flexDirection: 'row', alignItems: 'flex-end', width: 12, height: 10 },
  tickShort: { width: 2, height: 5, backgroundColor: '#fff', borderRadius: 1, transform: [{ rotate: '-40deg' }] },
  tickLong: { width: 2, height: 10, backgroundColor: '#fff', borderRadius: 1, transform: [{ rotate: '25deg' }], marginLeft: 1 },
  info: { flex: 1 },
  title: { fontSize: 16 },
  strikethrough: { textDecorationLine: 'line-through', color: '#999' },
  meta: { fontSize: 12, color: '#888', marginTop: 2 },
})

export default TaskItem
