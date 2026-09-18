import { getHistoricalDataset } from "./historicalData";

/**
 * Interpolates rank and percentile using historical dataset distributions.
 */
export function forecastRank(score, targetYear) {
  const dataset = getHistoricalDataset(targetYear);
  const data = dataset.score_distribution;
  const candidates = dataset.candidate_count;

  // Handle bounds
  const clampedScore = Math.max(0, Math.min(720, score));

  let lowerBand = data[0];
  let upperBand = data[data.length - 1];

  for (let i = 0; i < data.length - 1; i++) {
    const high = data[i];
    const low = data[i + 1];
    
    // Found the exact bracket
    if (clampedScore <= high.score && clampedScore >= low.score) {
      if (clampedScore === high.score) {
        return calculateBounds(high, candidates);
      }
      if (clampedScore === low.score) {
        return calculateBounds(low, candidates);
      }
      
      const range = high.score - low.score;
      const ratio = (clampedScore - low.score) / range; // 0 to 1

      // Interpolate rank and percentile linearly between the brackets
      const rank_median = Math.round(low.rank_median - ratio * (low.rank_median - high.rank_median));
      const rank_min = Math.round(low.rank_min - ratio * (low.rank_min - high.rank_min));
      const rank_max = Math.round(low.rank_max - ratio * (low.rank_max - high.rank_max));

      const bounds = {
        rank_median: Math.max(1, rank_median),
        rank_min: Math.max(1, rank_min),
        rank_max: Math.max(1, rank_max),
      };

      return calculateBounds(bounds, candidates);
    }
  }

  return calculateBounds(upperBand, candidates);
}

function calculateBounds(bracket, candidates) {
  const percentile = ((candidates - bracket.rank_median) / candidates) * 100;
  
  return {
    rankMedian: bracket.rank_median,
    rankMin: bracket.rank_min,
    rankMax: bracket.rank_max,
    percentile: Math.max(0, Math.min(100, percentile)),
    candidates: candidates
  };
}
