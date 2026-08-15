// Base rewards
const COINS_PER_TASK = 20;
const XP_PER_TASK = 50;

export const calculateRewards = (currentCoins: number, currentXp: number, currentLevel: number) => {
  const newCoins = currentCoins + COINS_PER_TASK;
  const newXp = currentXp + XP_PER_TASK;
  
  // Simple leveling formula: Every 500 XP = 1 Level
  const newLevel = Math.floor(newXp / 500) + 1;

  return { newCoins, newXp, newLevel };
};

export const calculateNewScore = (currentScore: number, planProgressPercentage: number) => {
  // 40% Plan Completion weight, 60% historical consistency
  // If they complete 100% of today's plan, their score trends up.
  const weightedProgress = planProgressPercentage * 0.4;
  const historicalWeight = currentScore * 0.6;
  
  return Math.round(weightedProgress + historicalWeight);
};
