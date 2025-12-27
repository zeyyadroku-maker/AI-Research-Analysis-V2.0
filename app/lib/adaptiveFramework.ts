/**
 * Adaptive Research Assessment Framework
 *
 * This framework adjusts assessment criteria and weights based on:
 * 1. Document Type (article, review, book, dissertation, etc.)
 * 2. Academic Field (Natural Sciences, Engineering, Medical, etc.)
 *
 * Each combination has specific credibility criteria and weighting
 */

import {
  DOCUMENT_TYPE_PATTERNS,
  ACADEMIC_FIELD_PATTERNS,
  STRUCTURE_PATTERNS
} from './constants/classificationPatterns'

import {
  COMPONENT_MAX_SCORES,
  BASE_WEIGHTS,
  FIELD_ADJUSTMENTS,
  BIAS_PRIORITIES,
  ASSESSMENT_FOCUS,
  TYPICAL_LIMITATIONS,
  COMMON_ASSUMPTIONS
} from './config/frameworkConfig'

export type DocumentType =
  | 'article'
  | 'review'
  | 'book'
  | 'dissertation'
  | 'proposal'
  | 'case-study'
  | 'essay'
  | 'theoretical'
  | 'preprint'
  | 'conference'
  | 'unknown'

export type AcademicField =
  | 'natural-sciences'
  | 'engineering'
  | 'medical'
  | 'agricultural'
  | 'social-sciences'
  | 'humanities'
  | 'formal-sciences'
  | 'interdisciplinary'
  | 'unknown'

export interface FrameworkWeights {
  methodologicalRigor: number // 0-2.5
  dataTransparency: number // 0-2.0
  sourceQuality: number // 0-1.5
  authorCredibility: number // 0-1.5
  statisticalValidity: number // 0-1.5
  logicalConsistency: number // 0-1.0
}

export interface FrameworkGuidelines {
  documentType: DocumentType
  field: AcademicField
  weights: FrameworkWeights
  biasPriorities: string[]
  assessmentFocus: string[]
  limitations: string[]
  assumptions: string[]
}

export interface ClassificationResult {
  primary: DocumentType | AcademicField
  confidence: number // 0-1, 1 = 100% confident
  fallbacks?: (DocumentType | AcademicField)[]
  otherMatches?: (DocumentType | AcademicField)[] // For interdisciplinary
}

/**
 * Detect document type based on keywords and content patterns
 * Enhanced to reduce "unknown" results with better heuristics
 */
export function classifyDocumentType(text: string, title?: string): DocumentType {
  const combined = `${title || ''} ${text}`.toLowerCase()

  // Check specific types first using extracted patterns
  for (const [type, patterns] of Object.entries(DOCUMENT_TYPE_PATTERNS)) {
    if (type === 'preprint' && title?.includes('arXiv')) return 'preprint'

    for (const pattern of patterns) {
      if (combined.match(pattern)) {
        // Additional checks for specific types to avoid false positives
        if (type === 'proposal' && combined.match(STRUCTURE_PATTERNS.results)) continue
        if (type === 'essay' && combined.match(STRUCTURE_PATTERNS.methodology)) continue
        if (type === 'theoretical' && combined.match(STRUCTURE_PATTERNS.methodology)) continue
        if (type === 'review' && combined.match(STRUCTURE_PATTERNS.methodology) && !combined.match(/meta-analysis/)) continue

        return type as DocumentType
      }
    }
  }

  // Check structure patterns for Article detection
  const hasAbstract = combined.includes('abstract') || combined.includes('introduction')
  const hasMethodology = combined.match(STRUCTURE_PATTERNS.methodology)
  const hasResults = combined.match(STRUCTURE_PATTERNS.results)
  const hasConclusion = combined.match(STRUCTURE_PATTERNS.conclusion)

  // Article logic
  if (hasMethodology && hasResults) {
    return 'article'
  }

  if (hasAbstract && hasConclusion) {
    return 'article'
  }

  // Catch-all: return unknown instead of default article
  return 'unknown'
}

/**
 * Detect academic field based on keywords and content
 * Enhanced with better pattern matching to reduce "interdisciplinary" results
 */
export function classifyAcademicField(text: string, title?: string): AcademicField {
  const combined = `${title || ''} ${text}`.toLowerCase()
  const fieldScores: Record<AcademicField, number> = {
    'natural-sciences': 0,
    'engineering': 0,
    'medical': 0,
    'agricultural': 0,
    'social-sciences': 0,
    'humanities': 0,
    'formal-sciences': 0,
    'interdisciplinary': 0,
    'unknown': 0
  }

  // Score each field based on keyword matches
  for (const [field, patterns] of Object.entries(ACADEMIC_FIELD_PATTERNS)) {
    // patterns[0] is high value (3 points), patterns[1] is low value (1 point)
    if (patterns[0] && combined.match(patterns[0])) {
      fieldScores[field as AcademicField] += 3
    }
    if (patterns[1] && combined.match(patterns[1])) {
      fieldScores[field as AcademicField] += 1
    }
  }

  // Find the highest scoring field
  const sortedFields = Object.entries(fieldScores)
    .filter(([field]) => field !== 'interdisciplinary')
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)

  // Return unknown if no strong match found
  if (sortedFields.length === 0 || sortedFields[0][1] === 0) {
    return 'unknown'
  }

  const topField = sortedFields[0][0] as AcademicField

  // Always return the top field to avoid "interdisciplinary" label
  return topField
}

/**
 * Get framework guidelines for a specific document type and field combination
 */
export function getFrameworkGuidelines(
  docType: DocumentType,
  field: AcademicField
): FrameworkGuidelines {
  const weights = getWeightsForCombination(docType, field)
  const biasPriorities = getBiasPriorities(field)
  const assessmentFocus = getAssessmentFocus(docType)
  const limitations = getTypicalLimitations(docType)
  const assumptions = getCommonAssumptions(field)

  return {
    documentType: docType,
    field,
    weights,
    biasPriorities,
    assessmentFocus,
    limitations,
    assumptions,
  }
}

/**
 * Get adaptive weights based on document type and field
 * Weights total to 10.0 points
 */
function getWeightsForCombination(docType: DocumentType, field: AcademicField): FrameworkWeights {
  const base = BASE_WEIGHTS[docType] || BASE_WEIGHTS.unknown
  const adjustment = field === 'unknown' ? {} : (FIELD_ADJUSTMENTS[field] || {})

  // Apply weights with CAPPING to component maximums
  const methodologicalRigor = Math.min(
    (base.methodologicalRigor || 0) + (adjustment.methodologicalRigor || 0),
    COMPONENT_MAX_SCORES.methodologicalRigor
  )
  const dataTransparency = Math.min(
    (base.dataTransparency || 0) + (adjustment.dataTransparency || 0),
    COMPONENT_MAX_SCORES.dataTransparency
  )
  const sourceQuality = Math.min(
    (base.sourceQuality || 0) + (adjustment.sourceQuality || 0),
    COMPONENT_MAX_SCORES.sourceQuality
  )
  const authorCredibility = Math.min(
    (base.authorCredibility || 0) + (adjustment.authorCredibility || 0),
    COMPONENT_MAX_SCORES.authorCredibility
  )
  const statisticalValidity = Math.min(
    (base.statisticalValidity || 0) + (adjustment.statisticalValidity || 0),
    COMPONENT_MAX_SCORES.statisticalValidity
  )
  const logicalConsistency = Math.min(
    (base.logicalConsistency || 0) + (adjustment.logicalConsistency || 0),
    COMPONENT_MAX_SCORES.logicalConsistency
  )

  // Validate that total weights don't exceed 10.0
  const total = methodologicalRigor + dataTransparency + sourceQuality + authorCredibility + statisticalValidity + logicalConsistency
  if (total > 10.01) {
    console.warn(`[Weight Validation] Total weights exceed 10.0 for ${docType}/${field}: ${total.toFixed(2)}. This should not occur.`)
  }

  return {
    methodologicalRigor,
    dataTransparency,
    sourceQuality,
    authorCredibility,
    statisticalValidity,
    logicalConsistency,
  }
}

/**
 * Get field-specific bias assessment priorities
 */
function getBiasPriorities(field: AcademicField): string[] {
  if (field === 'unknown') return BIAS_PRIORITIES.interdisciplinary
  return BIAS_PRIORITIES[field] || BIAS_PRIORITIES.interdisciplinary
}

/**
 * Get specific assessment focus areas
 */
function getAssessmentFocus(docType: DocumentType): string[] {
  return ASSESSMENT_FOCUS[docType] || ASSESSMENT_FOCUS.unknown
}

/**
 * Get common limitations for document type and field
 */
function getTypicalLimitations(docType: DocumentType): string[] {
  return TYPICAL_LIMITATIONS[docType] || TYPICAL_LIMITATIONS.unknown
}

/**
 * Get common assumptions for document type and field
 */
function getCommonAssumptions(field: AcademicField): string[] {
  if (field === 'unknown') return COMMON_ASSUMPTIONS.interdisciplinary
  return COMMON_ASSUMPTIONS[field] || COMMON_ASSUMPTIONS.interdisciplinary
}
