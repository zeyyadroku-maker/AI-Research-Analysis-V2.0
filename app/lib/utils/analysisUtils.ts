import { ConfidenceLevel, CredibilityScore } from '@/app/types'
// FrameworkWeights import removed as it is unused

// Helper to ensure confidence is a valid ConfidenceLevel
export const parseConfidence = (conf: any): ConfidenceLevel => {
    if (typeof conf === 'string') {
        const upper = conf.toUpperCase()
        if (['HIGH', 'MEDIUM', 'LOW', 'UNCERTAIN'].includes(upper)) {
            return upper as ConfidenceLevel
        }
    }
    // Legacy support for 0-100 numbers
    if (typeof conf === 'number') {
        if (conf >= 85) return 'HIGH'
        if (conf >= 60) return 'MEDIUM'
        if (conf >= 40) return 'LOW'
        return 'UNCERTAIN'
    }
    return 'MEDIUM' // Default
}

// Helper to sanitize component confidence
export const sanitizeComponent = (comp: any) => {
    if (!comp) return comp
    comp.confidence = parseConfidence(comp.confidence)
    return comp
}

export const calculateRating = (totalScore: number, maxWeight: number): 'Exemplary' | 'Strong' | 'Moderate' | 'Weak' | 'Very Poor' | 'Invalid' => {
    const scorePercentage = (totalScore / maxWeight) * 100
    if (scorePercentage >= 90) return 'Exemplary'
    if (scorePercentage >= 70) return 'Strong'
    if (scorePercentage >= 50) return 'Moderate'
    if (scorePercentage >= 30) return 'Weak'
    if (scorePercentage > 0) return 'Very Poor'
    return 'Invalid'
}

export const validateAndCapScore = (credibilityScore: any, maxWeight: number) => {
    if (!credibilityScore.totalScore && credibilityScore.totalScore !== 0) {
        throw new Error('Invalid analysis response: missing credibility totalScore')
    }

    // Cap score to max weight if needed
    if (credibilityScore.totalScore > maxWeight) {
        console.warn(
            `[Score Validation] Credibility score ${credibilityScore.totalScore.toFixed(2)} exceeds maximum weight ${maxWeight.toFixed(2)}. Capping to maximum.`
        )
        credibilityScore.totalScore = Math.min(credibilityScore.totalScore, maxWeight)
    }

    return credibilityScore
}

export const processCredibilityScore = (credibilityScore: any, maxWeight: number): CredibilityScore => {
    validateAndCapScore(credibilityScore, maxWeight)

    // Add maxTotalScore to credibility object
    credibilityScore.maxTotalScore = maxWeight

    // Ensure confidence levels are valid strings
    credibilityScore.overallConfidence = parseConfidence(credibilityScore.overallConfidence)

    credibilityScore.methodologicalRigor = sanitizeComponent(credibilityScore.methodologicalRigor)
    credibilityScore.dataTransparency = sanitizeComponent(credibilityScore.dataTransparency)
    credibilityScore.sourceQuality = sanitizeComponent(credibilityScore.sourceQuality)
    credibilityScore.authorCredibility = sanitizeComponent(credibilityScore.authorCredibility)
    credibilityScore.statisticalValidity = sanitizeComponent(credibilityScore.statisticalValidity)
    credibilityScore.logicalConsistency = sanitizeComponent(credibilityScore.logicalConsistency)

    credibilityScore.rating = calculateRating(credibilityScore.totalScore, maxWeight)

    return credibilityScore as CredibilityScore
}
