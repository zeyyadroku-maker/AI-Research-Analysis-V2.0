/**
 * Utility functions for normalizing credibility scores
 * Converts from dynamic max scores to 0-10 scale for consistent display
 */

/**
 * Normalize a credibility score to 0-10 scale
 * @param totalScore Current score (e.g., 6.7)
 * @param maxTotalScore Maximum possible score (e.g., 7.5)
 * @returns Normalized score on 0-10 scale (e.g., 8.9)
 */
export function getNormalizedScore(totalScore: number, maxTotalScore: number): number {
  // Validate inputs and convert to numbers
  const score = Number(totalScore) || 0
  const maxScore = Number(maxTotalScore) || 0

  // Return 0 if invalid inputs
  if (maxScore <= 0 || isNaN(score) || isNaN(maxScore)) return 0

  const percentage = (score / maxScore) * 100
  return (percentage / 100) * 10
}

/**
 * Get percentage of max score
 * @param totalScore Current score
 * @param maxTotalScore Maximum possible score
 * @returns Percentage (0-100)
 */
export function getScorePercentage(totalScore: number, maxTotalScore: number): number {
  if (maxTotalScore <= 0) return 0
  return Math.round((totalScore / maxTotalScore) * 100)
}

/**
 * Format a normalized score for display
 * @param totalScore Current score
 * @param maxTotalScore Maximum possible score
 * @param decimals Decimal places to show (default: 1)
 * @returns Formatted string (e.g., "8.9/10")
 */
export function formatNormalizedScore(
  totalScore: number,
  maxTotalScore: number,
  decimals: number = 1
): string {
  const normalized = getNormalizedScore(totalScore, maxTotalScore)
  return `${normalized.toFixed(decimals)}/10`
}
