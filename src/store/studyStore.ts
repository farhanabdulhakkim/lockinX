import { create } from 'zustand';

export interface Task {
  taskId: string;
  title: string;
  plannedMinutes: number;
  completedMinutes: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

interface StudyPlan {
  date: string;
  tasks: Task[];
  progressPercentage: number;
}

interface StudyState {
  currentPlan: StudyPlan | null;
  isLoadingPlan: boolean;
  setCurrentPlan: (plan: StudyPlan) => void;
  setLoadingPlan: (loading: boolean) => void;
}

export const useStudyStore = create<StudyState>((set) => ({
  currentPlan: null,
  isLoadingPlan: true,
  setCurrentPlan: (plan) => set({ currentPlan: plan }),
  setLoadingPlan: (isLoadingPlan) => set({ isLoadingPlan }),
}));
