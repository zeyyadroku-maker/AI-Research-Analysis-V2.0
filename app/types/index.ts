// Paper from OpenAlex API
export interface Paper {
  id: string
  title: string
  authors: string[]
  journal?: string
  doi?: string
  abstract?: string
  publicationDate?: string
  url?: string
  year?: number
  coreId?: string
  documentType?: string // From OpenAlex: 'article', 'book', 'preprint', etc.
  field?: string // Primary field classification from OpenAlex
  subfield?: string // Subfield classification from OpenAlex
  domain?: string // Domain classification from OpenAlex
  topics?: string[] // Research topics from OpenAlex
  citationCount?: number // Citation count from OpenAlex
  openAccessStatus?: boolean // Whether paper is open access
  openAlexId?: string // OpenAlex work ID
}

// === FRAMEWORK V2.0: CORE TYPES ===

// Confidence levels for all assessments
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNCERTAIN'

// Credibility Assessment Component (Framework v2.0)
export interface CredibilityComponent {
  name?: string // Optional as it's often the key in the parent object
  score: number
  maxScore: number
  description: string
  evidence: string[] // Specific quotes/evidence from paper
  confidence: ConfidenceLevel // Required for every component
  reasoning: string // Explanation of WHY this score was given
  limitations?: string[] // What cannot be assessed from this document
}

// Overall Credibility Score (0-10 scale)
export interface CredibilityScore {
  methodologicalRigor: CredibilityComponent // 0-2.5
  dataTransparency: CredibilityComponent // 0-2.0
  sourceQuality: CredibilityComponent // 0-1.5
  authorCredibility: CredibilityComponent // 0-1.5
  statisticalValidity: CredibilityComponent // 0-1.5
  logicalConsistency: CredibilityComponent // 0-1.0
  totalScore: number
  maxTotalScore: number // Maximum possible score based on framework weights
  rating: 'Exemplary' | 'Strong' | 'Moderate' | 'Weak' | 'Very Poor' | 'Invalid'
  overallConfidence: ConfidenceLevel // Overall confidence in assessment
}

// Red Flag Detection (Framework v2.0)
export interface RedFlag {
  type: 'INDUSTRY_BIAS' | 'PREDATORY_JOURNAL' | 'STATISTICAL_ANOMALY' |
  'MISSING_ETHICS' | 'CONTRADICTIONS' | 'NOVEL_HIGH_STAKES' |
  'FUNDING_BIAS' | 'INTERNAL_CONTRADICTION' // Added from v2.0 spec
  description: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'WARNING' // Unified severity levels
  evidence?: string // Optional to maintain compatibility if needed
  requiresAction?: string // Added from v2.0 spec
  recommendation?: string // Kept for compatibility
  requiresHumanReview?: boolean // Kept for compatibility
}

// Bias Detection (Enhanced for Framework v2.0)
export interface BiasDetection {
  type: 'Selection' | 'Confirmation' | 'Publication' | 'Reporting' |
  'Funding' | 'Citation' | 'Demographic' | 'Measurement'
  evidence: string
  severity: 'Low' | 'Medium' | 'High'
  confidence: ConfidenceLevel // Confidence in bias detection
  verifiable: boolean // Can this claim be verified from the document
  impact?: string // How this bias affects findings
  mitigation?: string // How bias was or wasn't mitigated
}

export interface BiasAnalysis {
  biases: BiasDetection[]
  overallLevel: 'Minimal' | 'Low' | 'Medium' | 'High'
  overallConfidence: ConfidenceLevel // NEW: Overall confidence in bias assessment
  justification: string
}

// AI Assessment Limitations (Framework v2.0)
export interface AILimitations {
  cannotAssess: string[] // What AI genuinely cannot evaluate
  requiresExpertReview: string[] // Specific areas needing human validation
  uncertaintyAreas: string[] // Where confidence is low
  // Legacy fields for compatibility
  requiredExpertise?: string[]
  missingInformation?: string[]
  confidenceNote?: string
}

// Human Review Recommendation (Framework v2.0)
export interface HumanReviewRecommendation {
  priority: 'MANDATORY' | 'STANDARD' | 'OPTIONAL'
  reason: string // Changed from reasons[] to string to match v2.0 spec, or keep both? Let's keep reason as primary.
  suggestedExperts: string[] // Added from v2.0 spec
  // Legacy fields for compatibility
  reasons?: string[]
  specificAreas?: string[]
  expertiseRequired?: string[]
}

// Key Findings
export interface ResearchFundamentals {
  title: string
  authors: string[]
  journal: string
  doi?: string
  publicationDate: string
  articleType: string
}

export interface Methodology {
  studyDesign: string
  sampleSize: string
  population: string
  samplingMethod: string
  setting: string
  intervention?: string
  comparisonGroups?: string
  outcomesMeasures: string[]
  statisticalMethods: string[]
  studyDuration: string
}

export interface Findings {
  primaryFindings: string[]
  secondaryFindings: string[]
  effectSizes: string[]
  clinicalSignificance: string
  unexpectedFindings: string[]
}

export interface Limitations {
  authorAcknowledged: string[]
  methodologicalIdentified: string[]
  severity: 'Minor' | 'Moderate' | 'Major'
}

export interface Conclusions {
  primaryConclusion: string
  supportedByData: boolean
  practicalImplications: string[]
  futureResearchNeeded: string[]
  recommendations: string[]
  generalizability: string
}

export interface KeyFindings {
  fundamentals: ResearchFundamentals
  researchQuestion: string
  hypothesis?: string
  methodology: Methodology
  findings: Findings
  limitations: Limitations
  conclusions: Conclusions
}

// Research Perspective
export interface ResearchPerspective {
  theoreticalFramework: string
  paradigm: 'Positivist' | 'Interpretivist' | 'Critical' | 'Pragmatic'
  disciplinaryPerspective: string
  epistemologicalStance: string
  assumptions: {
    stated: string[]
    unstated: string[]
  }
  ideologicalPosition?: string
  authorReflexivity?: string
  context: {
    geographic: string
    temporal: string
    institutional: string
  }
}

// Analysis Limitations and Unverifiable Claims
export interface AnalysisLimitations {
  unverifiableClaims: Array<{
    claim: string
    reason: string // Why it cannot be verified
    section: string // Which section of analysis this applies to
  }>
  dataLimitations: string[] // Limitations due to abstract/partial text only
  uncertainties: string[] // Areas where AI has low confidence
  aiConfidenceNote: string // General note about AI limitations in this analysis
}

// Document Classification (Framework v2.0)
export interface DocumentClassification {
  documentType: string
  field: string
  confidence: ConfidenceLevel
  source?: 'DOI' | 'AI' | 'USER' // Source of the classification for UI display priority
}

// Complete Analysis Result (Framework v2.0)
export interface AnalysisResult {
  // Paper information
  paper: Paper

  // Document classification
  classification: DocumentClassification

  // Core assessments
  credibility: CredibilityScore
  bias: BiasAnalysis
  keyFindings: KeyFindings
  perspective: ResearchPerspective

  // Framework v2.0: Quality and transparency
  redFlags: RedFlag[]
  aiLimitations: AILimitations
  humanReview: HumanReviewRecommendation

  // Legacy limitations field (kept for compatibility)
  limitations: AnalysisLimitations

  // Metadata
  timestamp: string
}

// Bookmarked Paper
export interface BookmarkedPaper {
  id: string
  analysis: AnalysisResult
  bookmarkedAt: string
  notes?: string
}

// Search Response from CORE API
export interface CoreSearchResponse {
  status: string
  hasMore: boolean
  totalHits: number
  data: CorePaper[]
}

export interface CorePaper {
  id: string
  title: string
  authors?: Array<{
    name: string
  }>
  abstract?: string
  doi?: string
  datePublished?: string
  downloadUrl?: string
  fullTextUrl?: string
  year?: number
}

