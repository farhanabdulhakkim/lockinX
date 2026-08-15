import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useStudyStore, Task } from '../../store/studyStore';
import { fetchOrResetTodayPlan, addTaskToPlan } from '../../services/studyPlanService';
import { completeTaskInDb } from '../../services/gamificationService';
import CustomButton from '../../components/CustomButton';
import AnimatedProgressBar from '../../components/AnimatedProgressBar';

export default function StudyPlanScreen() {
  const user = useAuthStore((state) => state.user);
  const { currentPlan, isLoadingPlan, setCurrentPlan, setLoadingPlan } = useStudyStore();
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState('');
  const [isCompleting, setIsCompleting] = useState<string | null>(null);

  useEffect(() => {
    const loadPlan = async () => {
      if (!user) return;
      setLoadingPlan(true);
      const plan = await fetchOrResetTodayPlan(user.uid);
      setCurrentPlan(plan as any);
      setLoadingPlan(false);
    };
    loadPlan();
  }, [user]);

  const handleAddTask = async () => {
    if (!user || !currentPlan || !newTaskTitle || !newTaskDuration) return;
    const newTask: Task = {
      taskId: Math.random().toString(36).substring(7),
      title: newTaskTitle,
      plannedMinutes: parseInt(newTaskDuration),
      completedMinutes: 0,
      status: 'PENDING'
    };
    const updatedTasks = await addTaskToPlan(user.uid, currentPlan.tasks, newTask);
    setCurrentPlan({ ...currentPlan, tasks: updatedTasks });
    setNewTaskTitle('');
    setNewTaskDuration('');
  };

  const handleCompleteTask = async (taskId: string) => {
    if (!user || !currentPlan) return;
    setIsCompleting(taskId);
    
    try {
      const { updatedTasks, progressPercentage } = await completeTaskInDb(user.uid, taskId, currentPlan.tasks);
      setCurrentPlan({ ...currentPlan, tasks: updatedTasks, progressPercentage });
      Alert.alert("LOCKED IN", "+50 XP | +20 Coins 🔥");
    } catch (error) {
      Alert.alert("Error", "Could not complete task.");
    } finally {
      setIsCompleting(null);
    }
  };

  if (isLoadingPlan) return <View style={styles.container}><ActivityIndicator color="#fff" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Today's Plan</Text>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
        <Text style={styles.progress}>Progress</Text>
        <Text style={styles.progressValue}>{currentPlan?.progressPercentage || 0}%</Text>
      </View>
      <AnimatedProgressBar progress={currentPlan?.progressPercentage || 0} />

      <FlatList
        data={currentPlan?.tasks || []}
        keyExtractor={(item) => item.taskId}
        renderItem={({ item }) => (
          <View style={[styles.taskCard, item.status === 'COMPLETED' && styles.taskCompleted]}>
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              <Text style={styles.taskTime}>{item.completedMinutes} / {item.plannedMinutes} mins</Text>
            </View>
            
            {item.status !== 'COMPLETED' && (
              <TouchableOpacity 
                style={styles.completeBtn} 
                onPress={() => handleCompleteTask(item.taskId)}
                disabled={isCompleting === item.taskId}
              >
                {isCompleting === item.taskId ? <ActivityIndicator color="#000" size="small" /> : <Text style={styles.completeBtnText}>✓</Text>}
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No tasks locked in for today.</Text>}
      />

      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Task (e.g. DSA)" placeholderTextColor="#666" value={newTaskTitle} onChangeText={setNewTaskTitle} />
        <TextInput style={styles.input} placeholder="Minutes (e.g. 120)" placeholderTextColor="#666" value={newTaskDuration} onChangeText={setNewTaskDuration} keyboardType="numeric" />
        <CustomButton title="ADD TASK" onPress={handleAddTask} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 24, paddingTop: 60 },
  header: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  progress: { color: '#888', fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase' },
  progressValue: { color: '#4ade80', fontSize: 24, fontWeight: '900' },
  taskCard: { backgroundColor: '#111', padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#333', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  taskCompleted: { borderColor: '#4ade80', opacity: 0.8 },
  taskInfo: { flex: 1 },
  taskTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  taskTime: { color: '#888', fontSize: 16, marginTop: 4 },
  completeBtn: { backgroundColor: '#fff', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  completeBtnText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  emptyText: { color: '#666', fontStyle: 'italic', marginTop: 20 },
  inputContainer: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#333', paddingTop: 20 },
  input: { backgroundColor: '#111', color: '#fff', padding: 16, borderRadius: 8, marginBottom: 12, fontSize: 16 }
});
