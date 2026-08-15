import { db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { calculateRewards, calculateNewScore } from '../utils/gamificationUtils';
import { Task } from '../store/studyStore';

export const completeTaskInDb = async (userId: string, taskId: string, currentTasks: Task[]) => {
  // 1. Update the specific task status
  const updatedTasks = currentTasks.map(task => 
    task.taskId === taskId 
      ? { ...task, status: 'COMPLETED' as const, completedMinutes: task.plannedMinutes }
      : task
  );

  // 2. Calculate new daily progress
  const totalPlanned = updatedTasks.reduce((sum, t) => sum + t.plannedMinutes, 0);
  const totalCompleted = updatedTasks.reduce((sum, t) => sum + t.completedMinutes, 0);
  const progressPercentage = totalPlanned === 0 ? 0 : Math.round((totalCompleted / totalPlanned) * 100);

  // 3. Update the Plan in Firestore
  const planRef = doc(db, 'currentPlans', userId);
  await updateDoc(planRef, {
    tasks: updatedTasks,
    progressPercentage,
    updatedAt: new Date().toISOString()
  });

  // 4. Fetch user's current stats
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const userData = userSnap.data();
    const { newCoins, newXp, newLevel } = calculateRewards(userData.coins || 0, userData.xp || 0, userData.level || 1);
    const newScore = calculateNewScore(userData.consistencyScore || 0, progressPercentage);
    
    // Handle Streak Logic
    const today = new Date().toISOString().split('T')[0];
    let newStreak = userData.currentStreak || 0;
    
    // If they haven't completed a task today yet, increase streak
    if (userData.lastCompletionDate !== today) {
      newStreak += 1;
    }

    // 5. Save new stats to user profile
    await updateDoc(userRef, {
      coins: newCoins,
      xp: newXp,
      level: newLevel,
      consistencyScore: newScore,
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, userData.longestStreak || 0),
      lastCompletionDate: today
    });
  }

  return { updatedTasks, progressPercentage };
};
