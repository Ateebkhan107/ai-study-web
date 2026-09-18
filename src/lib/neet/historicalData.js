import { NEET_HISTORICAL_DATA } from "../../data/admission/neet";

export function getAvailableYears() {
  return Object.keys(NEET_HISTORICAL_DATA).map(Number).sort((a, b) => b - a);
}

export function getHistoricalDataset(year) {
  if (!NEET_HISTORICAL_DATA[year]) {
    // Fallback to most recent if specific year is not available
    const available = getAvailableYears();
    return NEET_HISTORICAL_DATA[available[0]];
  }
  return NEET_HISTORICAL_DATA[year];
}

export function getAllHistoricalDatasets() {
  return Object.values(NEET_HISTORICAL_DATA).sort((a, b) => b.year - a.year);
}
