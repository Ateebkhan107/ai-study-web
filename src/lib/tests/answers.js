// Number(null), Number(false), and Number("") are zero, not option A selections.
export function mcqIndex(value) {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && !/^[0-3]$/.test(value.trim())) return null;
  const index = Number(value);
  return Number.isInteger(index) && index >= 0 && index <= 3 ? index : null;
}
export function hasNumericAnswer(value) {
  return (typeof value === "string" || typeof value === "number") && String(value).trim() !== "";
}
