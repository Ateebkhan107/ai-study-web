export function getLevelFromXP(totalXP) {
  const xp = Math.max(0, totalXP);
  
  // Pre-defined thresholds matching the progressive example
  const baseThresholds = [0, 500, 1200, 2200, 3500, 5000];
  
  let currentLevel = 1;
  let currentLevelXP = 0;
  let nextLevelXP = 500;

  if (xp < baseThresholds[baseThresholds.length - 1]) {
    // Find the level in the base thresholds
    for (let i = 0; i < baseThresholds.length; i++) {
      if (xp < baseThresholds[i]) {
        currentLevel = i;
        currentLevelXP = baseThresholds[i - 1];
        nextLevelXP = baseThresholds[i];
        break;
      }
    }
  } else {
    // Scale beyond Level 6 naturally
    currentLevel = baseThresholds.length; // starts at 6
    currentLevelXP = baseThresholds[currentLevel - 1]; // 5000
    let increment = 1500; // The step from L5 to L6 was 1500
    nextLevelXP = currentLevelXP + increment;

    while (xp >= nextLevelXP) {
      currentLevel++;
      currentLevelXP = nextLevelXP;
      // Increase the XP gap for the next level
      increment += 300; 
      nextLevelXP += increment;
    }
  }

  const progressXP = xp - currentLevelXP;
  const xpRequiredForNext = nextLevelXP - currentLevelXP;
  const progressPercentage = Math.min(100, Math.max(0, (progressXP / xpRequiredForNext) * 100));
  const xpRemaining = nextLevelXP - xp;

  return {
    currentLevel,
    currentLevelXP,
    nextLevelXP,
    progressPercentage,
    xpRemaining,
    totalXP: xp
  };
}
