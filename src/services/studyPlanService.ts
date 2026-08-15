import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Task } from '../store/studyStore';

// Get today's date in YYYY-MM-DD format
const getTodayString = () => new Date().toISOString().split('T')[0];

export const fetchOrResetTodayPlan = async (userId: string) => {
  const today = getTodayString();
  const planRef = doc(db, 'currentPlans', userId);
  const planSnap = await getDoc(planRef);

  if (planSnap.exists()) {
    const data = planSnap.data();
    // If it's today's plan, return it
    if (data.date === today) {
      return data;
    }
  }

  // If no plan exists, OR it's from yesterday -> Perform Daily Reset
  const newPlan = {
    date: today,
    tasks: [],
    progressPercentage: 0,
    updatedAt: new Date().toISOString()
  };

  await setDoc(planRef, newPlan);
  return newPlan;
};

export const addTaskToPlan = async (userId: string, currentTasks: Task[], newTask: Task) => {
  const planRef = doc(db, 'currentPlans', userId);
  const updatedTasks = [...currentTasks, newTask];
  
  await updateDoc(planRef, {
    tasks: updatedTasks,
    updatedAt: new Date().toISOString()
  });
  
  return updatedTasks;
};
