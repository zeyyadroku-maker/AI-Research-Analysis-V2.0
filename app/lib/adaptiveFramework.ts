/**
 * Adaptive Research Assessment Framework
 *
 * This framework adjusts assessment criteria and weights based on:
 * 1. Document Type (article, review, book, dissertation, etc.)
 * 2. Academic Field (Natural Sciences, Engineering, Medical, etc.)
 *
 * Each combination has specific credibility criteria and weighting
 */

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

  // Extract patterns
  const hasAbstract = combined.includes('abstract')
  const hasMethodology = combined.match(/method|procedure|approach|design|protocol|experiment|test|sample|variable|hypothesis/)
  const hasResults = combined.match(/result|finding|outcome|data|show|demonstrate|evidence|conclude/)
  const hasDiscussion = combined.match(/discussion|implication|limitation|interpret|analyse|analyze|significance/)
  const hasConclusion = combined.match(/conclusion|summary|concluding|conclude|final remark|future work|implication/)

  // Preprint/ArXiv - check early and specific
  if (combined.match(/preprint|arxiv|not peer-reviewed|eprint/) || title?.includes('arXiv')) {
    return 'preprint'
  }

  // Conference proceedings
  if (combined.match(/\b(conference|proceeding|workshop|symposium|proceedings|conference paper|conference abstract)\b/)) {
    return 'conference'
  }

  // Dissertation/Thesis
  if (combined.match(/\b(dissertation|thesis|doctoral dissertation|master.?s thesis|phd dissertation)\b/) || combined.length > 500000) {
    return 'dissertation'
  }

  // Book characteristics - substantial length or book-specific markers
  if (combined.match(/\b(book|chapter|volume|edited collection|edited book|textbook|monograph)\b/) || combined.length > 300000) {
    return 'book'
  }

  // Case study - specific pattern
  if (combined.match(/\b(case study|case analysis|case report|case presentation|single case|case example)\b/)) {
    return 'case-study'
  }

  // Proposal - future tense without results
  if (combined.match(/\b(proposal|propose|proposed|propose to|proposal for|aims to|objectives|will conduct|research plan)\b/) && !hasResults) {
    return 'proposal'
  }

  // Essay - opinion/perspective without methodology
  if (combined.match(/\b(essay|perspective|opinion|commentary|editorial|viewpoint|reflective essay|critical essay)\b/) && !hasMethodology) {
    return 'essay'
  }

  // Theoretical/Conceptual - theory focus without empirical methodology
  if (combined.match(/\b(theory|theoretical|conceptual|theoretical framework|concept|model|philosophical|conceptual model)\b/) && !hasMethodology) {
    return 'theoretical'
  }

  // Review/Survey/Systematic Review - literature synthesis
  if (combined.match(/\b(review|survey|systematic review|meta-analysis|scoping review|narrative review|literature review|examination of|synthesis of literature|state of the art)\b/) && !hasMethodology) {
    return 'review'
  }

  // Article - most common: has empirical methodology and results
  // Check for the full research article structure
  if ((hasAbstract || combined.includes('introduction')) && hasMethodology && hasResults) {
    return 'article'
  }

  // Fallback article detection - if it has methodology and results, likely an article
  if (hasMethodology && hasResults && (hasDiscussion || hasConclusion)) {
    return 'article'
  }

  // Empirical study with data analysis (article without explicit abstract marker)
  if (hasMethodology && hasResults) {
    return 'article'
  }

  // If it has results/findings/outcomes, likely article or research document
  if (hasResults && hasMethodology) {
    return 'article'
  }

  // If it has clear research structure, default to article
  if ((hasAbstract || combined.includes('introduction')) && hasConclusion) {
    return 'article'
  }

  // Catch-all: if it looks like a substantial academic document, call it an article
  // Catch-all: default to article as the most common academic document type
  return 'article'
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
  }

  // Score each field based on keyword matches
  // Natural Sciences (physics, chemistry, biology, astronomy)
  if (combined.match(/\b(physics|chemistry|biology|quantum|molecular|atomic|particle|astronomy|astrophysics|geology|botany|zoology|oceanography|mineralogy|petrology|seismology|meteorology)\b/)) {
    fieldScores['natural-sciences'] += 3
  }
  if (combined.match(/\b(nuclei|electron|photon|energy|wavelength|frequency|atom|molecule|organic|inorganic|reaction|compound|isotope|element|mineral|rock|fossil|species|organism|cell|gene|protein|dna|enzyme|metabolism|photosynthesis|evolution|natural selection)\b/)) {
    fieldScores['natural-sciences'] += 1
  }

  // Engineering & Technology (electrical, mechanical, civil, computer)
  if (combined.match(/\b(engineering|software|algorithm|circuit|mechanical|electrical|civil|computer science|programming|coding|database|system|network|automation|manufacturing|construction|infrastructure|hardware|firmware|application|framework|api|framework|design pattern|agile|devops|cloud)\b/)) {
    fieldScores['engineering'] += 3
  }
  if (combined.match(/\b(mechanical|structural|thermal|fluid|stress|strength|load|efficiency|optimization|control|signal|processing|encryption|architecture|module|component|integration|testing|deployment|scalability)\b/)) {
    fieldScores['engineering'] += 1
  }

  // Medical Sciences (medicine, clinical, pharmaceuticals, health)
  if (combined.match(/\b(medical|clinical|pharmaceutical|medicine|health|disease|patient|treatment|diagnosis|therapy|surgery|nursing|hospital|prescription|medication|drug|vaccine|infection|inflammation|symptom|pathology|anatomy|physiology|oncology|cardiology|neurology|psychiatry|dermatology|pediatrics|geriatrics)\b/)) {
    fieldScores['medical'] += 3
  }
  if (combined.match(/\b(therapeutic|intervention|efficacy|safety|adverse event|complication|prognosis|remission|relapse|comorbidity|biomarker|clinical trial|randomized controlled|double blind|placebo|cohort|retrospective|prospective|case control)\b/)) {
    fieldScores['medical'] += 1
  }

  // Agricultural & Environmental Sciences
  if (combined.match(/\b(agriculture|environmental|climate|forestry|fisheries|sustainable|conservation|ecology|ecosystem|crop|soil|water|pollution|biodiversity|habitat|species protection|renewable|green|carbon|emission|environmental impact|sustainability)\b/)) {
    fieldScores['agricultural'] += 3
  }
  if (combined.match(/\b(agricultural practice|farming|livestock|irrigation|pest management|soil quality|water quality|watershed|endangered|conservation strategy|environmental assessment|climate change impact|ecological restoration)\b/)) {
    fieldScores['agricultural'] += 1
  }

  // Social Sciences (psychology, sociology, economics, political science)
  if (combined.match(/\b(psychology|sociology|economics|political|anthropology|behavior|society|social|culture|institution|demographic|survey|questionnaire|interview|participant|respondent|statistical analysis|correlation|regression|hypothesis testing|sample|population|variables)\b/)) {
    fieldScores['social-sciences'] += 3
  }
  if (combined.match(/\b(cognitive|emotion|motivation|perception|learning|memory|personality|development|relationship|family|group|organization|management|leadership|decision making|economic theory|market|trade|finance|political system|governance|law|education|welfare)\b/)) {
    fieldScores['social-sciences'] += 1
  }

  // Humanities (history, philosophy, literature, languages)
  if (combined.match(/\b(history|philosophy|literature|language|linguistics|humanities|art|culture|civilization|classic|ancient|medieval|renaissance|period|era|dynasty|empire|author|poet|writer|literary|linguistic|semantic|syntax|dialect|etymology|translation)\b/)) {
    fieldScores['humanities'] += 3
  }
  if (combined.match(/\b(historical context|philosophical argument|literary analysis|linguistic structure|cultural meaning|artistic expression|interpretation|critique|textual|manuscript|archive|historical document|cultural heritage|intellectual history|moral theory|aesthetics|hermeneutics)\b/)) {
    fieldScores['humanities'] += 1
  }

  // Formal Sciences (mathematics, logic, statistics, computer science theory)
  if (combined.match(/\b(mathematics|mathematical|geometry|algebra|logic|statistics|formal|proof|theorem|axiom|equation|calculus|topology|set theory|number theory|abstract algebra|linear algebra|group theory|ring theory|field theory|probability|distribution|hypothesis test|confidence interval|variance|covariance)\b/)) {
    fieldScores['formal-sciences'] += 3
  }
  if (combined.match(/\b(mathematical model|algorithm analysis|computational complexity|theorem proving|formal verification|discrete mathematics|combinatorics|graph theory|function|mapping|transformation|sequence|series|limit|derivative|integral|matrix|vector|eigenvalue|optimization|constraint satisfaction)\b/)) {
    fieldScores['formal-sciences'] += 1
  }

  // Find the highest scoring field
  const sortedFields = Object.entries(fieldScores)
    .filter(([field]) => field !== 'interdisciplinary')
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)

  // If no strong match, default to social sciences as it's broad, or natural sciences if keywords suggest
  if (sortedFields.length === 0 || sortedFields[0][1] === 0) {
    // Fallback logic: check for broad academic terms
    if (combined.match(/experiment|lab|data|measurement/)) return 'natural-sciences'
    return 'social-sciences' // Default fallback
  }

  const topField = sortedFields[0][0] as AcademicField

  // Always return the top field to avoid "interdisciplinary" label
  // Even if scores are close, the primary field is more useful for specific criteria
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
 *
 * Component maximums (enforced):
 * - Methodological Rigor: 0-2.5
 * - Data Transparency: 0-2.0
 * - Source Quality: 0-1.5
 * - Author Credibility: 0-1.5
 * - Statistical Validity: 0-1.5
 * - Logical Consistency: 0-1.0
 */
function getWeightsForCombination(docType: DocumentType, field: AcademicField): FrameworkWeights {
  // Component maximum values - ENFORCED
  const componentMaxes = {
    methodologicalRigor: 2.5,
    dataTransparency: 2.0,
    sourceQuality: 1.5,
    authorCredibility: 1.5,
    statisticalValidity: 1.5,
    logicalConsistency: 1.0,
  }

  const baseWeights: Record<DocumentType, FrameworkWeights> = {
    article: {
      methodologicalRigor: 2.5,
      dataTransparency: 2.0,
      sourceQuality: 1.5,
      authorCredibility: 1.0,
      statisticalValidity: 1.5,
      logicalConsistency: 0.5,
    },
    review: {
      methodologicalRigor: 1.0,
      dataTransparency: 1.5,
      sourceQuality: 2.5,
      authorCredibility: 1.5,
      statisticalValidity: 0.5,
      logicalConsistency: 1.5,
    },
    book: {
      methodologicalRigor: 1.5,
      dataTransparency: 1.5,
      sourceQuality: 2.0,
      authorCredibility: 2.0,
      statisticalValidity: 0.5,
      logicalConsistency: 1.0,
    },
    dissertation: {
      methodologicalRigor: 2.5,
      dataTransparency: 2.0,
      sourceQuality: 1.5,
      authorCredibility: 0.5,
      statisticalValidity: 1.5,
      logicalConsistency: 1.0,
    },
    proposal: {
      methodologicalRigor: 2.0,
      dataTransparency: 1.5,
      sourceQuality: 1.5,
      authorCredibility: 1.0,
      statisticalValidity: 0.5,
      logicalConsistency: 1.5,
    },
    'case-study': {
      methodologicalRigor: 1.5,
      dataTransparency: 2.0,
      sourceQuality: 1.5,
      authorCredibility: 1.0,
      statisticalValidity: 1.0,
      logicalConsistency: 1.5,
    },
    essay: {
      methodologicalRigor: 0.5,
      dataTransparency: 1.0,
      sourceQuality: 2.0,
      authorCredibility: 2.0,
      statisticalValidity: 0.5,
      logicalConsistency: 1.0,
    },
    theoretical: {
      methodologicalRigor: 0.5,
      dataTransparency: 1.0,
      sourceQuality: 1.5,
      authorCredibility: 1.5,
      statisticalValidity: 0.5,
      logicalConsistency: 1.0,
    },
    preprint: {
      methodologicalRigor: 2.0,
      dataTransparency: 1.5,
      sourceQuality: 1.0,
      authorCredibility: 1.0,
      statisticalValidity: 1.5,
      logicalConsistency: 1.0,
    },
    conference: {
      methodologicalRigor: 2.0,
      dataTransparency: 1.5,
      sourceQuality: 1.5,
      authorCredibility: 0.8,
      statisticalValidity: 1.3,
      logicalConsistency: 1.0,
    },
    unknown: {
      methodologicalRigor: 1.5,
      dataTransparency: 1.5,
      sourceQuality: 1.5,
      authorCredibility: 1.5,
      statisticalValidity: 1.0,
      logicalConsistency: 1.0,
    },
  }

  // Field-specific adjustments (these are DELTAS, carefully sized to not exceed maxes)
  const fieldAdjustments: Record<AcademicField, Partial<FrameworkWeights>> = {
    'natural-sciences': {
      methodologicalRigor: 0.3,
      statisticalValidity: 0.2,
    },
    'engineering': {
      methodologicalRigor: 0.2,
      dataTransparency: 0.2,
    },
    'medical': {
      methodologicalRigor: 0.3,
      statisticalValidity: 0.3,
    },
    'agricultural': {
      methodologicalRigor: 0.2,
      statisticalValidity: 0.1,
    },
    'social-sciences': {
      methodologicalRigor: 0.1,
      logicalConsistency: 0.1,
    },
    'humanities': {
      sourceQuality: 0.2,
      logicalConsistency: 0.0, // Changed from 0.2 to prevent exceeding 1.0 max
    },
    'formal-sciences': {
      logicalConsistency: 0.0, // Changed from 0.3 to prevent exceeding 1.0 max
      statisticalValidity: 0.2,
    },
    'interdisciplinary': {},
  }

  const base = baseWeights[docType] || baseWeights.unknown
  const adjustment = fieldAdjustments[field] || {}

  // Apply weights with CAPPING to component maximums
  const methodologicalRigor = Math.min(
    (base.methodologicalRigor || 0) + (adjustment.methodologicalRigor || 0),
    componentMaxes.methodologicalRigor
  )
  const dataTransparency = Math.min(
    (base.dataTransparency || 0) + (adjustment.dataTransparency || 0),
    componentMaxes.dataTransparency
  )
  const sourceQuality = Math.min(
    (base.sourceQuality || 0) + (adjustment.sourceQuality || 0),
    componentMaxes.sourceQuality
  )
  const authorCredibility = Math.min(
    (base.authorCredibility || 0) + (adjustment.authorCredibility || 0),
    componentMaxes.authorCredibility
  )
  const statisticalValidity = Math.min(
    (base.statisticalValidity || 0) + (adjustment.statisticalValidity || 0),
    componentMaxes.statisticalValidity
  )
  const logicalConsistency = Math.min(
    (base.logicalConsistency || 0) + (adjustment.logicalConsistency || 0),
    componentMaxes.logicalConsistency
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
  const basePriorities: Record<AcademicField, string[]> = {
    'natural-sciences': [
      'Selection bias in experimental design',
      'Measurement bias from instrumentation',
      'Publication bias for significant results',
      'Funding source influence',
    ],
    'engineering': [
      'Confirmation bias in design choices',
      'Incomplete testing of edge cases',
      'Scalability assumptions not verified',
      'Cost-benefit bias in recommendations',
    ],
    'medical': [
      'Patient selection bias',
      'Placebo effect (if applicable)',
      'Publication bias for efficacy claims',
      'Conflict of interest from pharmaceutical funding',
      'Reporting bias on adverse effects',
    ],
    'agricultural': [
      'Environmental variation not controlled',
      'Seasonal/temporal bias',
      'Economic incentive bias',
      'Publication bias for positive results',
    ],
    'social-sciences': [
      'Demographic sampling bias',
      'Social desirability bias',
      "Researcher's cultural assumptions",
      'Selection effects in self-report',
    ],
    'humanities': [
      "Interpretive bias based on author's perspective",
      'Selective evidence citation',
      'Presentist bias (applying modern standards)',
      'Source authenticity concerns',
    ],
    'formal-sciences': [
      'Assumption validity in axioms',
      'Proof completeness',
      'Generalizability of abstract results',
      'Computational bias (approximation errors)',
    ],
    'interdisciplinary': [
      'Disciplinary assumption conflicts',
      'Method appropriateness across domains',
      'Oversimplification of complexity',
    ],
  }

  return basePriorities[field] || basePriorities.interdisciplinary
}

/**
 * Get specific assessment focus areas
 */
function getAssessmentFocus(docType: DocumentType): string[] {
  const focus: Record<DocumentType, string[]> = {
    'article': [
      'Study design appropriateness',
      'Sample size adequacy',
      'Statistical power',
      'Conflict of interest disclosure',
      'Reproducibility information',
    ],
    'review': [
      'Comprehensiveness of literature search',
      'Selection criteria for included papers',
      'Quality assessment of source papers',
      'Synthesis methodology',
      'Currency of sources',
    ],
    'book': [
      'Author credentials and expertise',
      'Evidence quality for claims',
      'Comprehensive treatment of topic',
      'Logical flow and organization',
      'Academic rigor vs. accessibility',
    ],
    'dissertation': [
      'Research novelty and contribution',
      'Methodological rigor',
      'Committee credentials',
      'Data integrity and security',
      'Ethical approval documentation',
    ],
    'proposal': [
      'Feasibility of proposed work',
      'Timeline and resource realism',
      'Preliminary evidence quality',
      'Budget justification',
      'Contingency planning',
    ],
    'case-study': [
      'Case selection justification',
      'Data collection rigor',
      'Triangulation methods',
      'Researcher reflexivity',
      'Transferability limitations',
    ],
    'essay': [
      'Argument logical coherence',
      'Evidence quality for claims',
      "Author's expertise in topic",
      'Acknowledgment of counterarguments',
      'Writing clarity and organization',
    ],
    'theoretical': [
      'Internal consistency of theory',
      'Logical rigor of definitions',
      'Falsifiability of propositions',
      'Practical application potential',
      'Clarity of theoretical framework',
    ],
    'preprint': [
      'Preliminary validation available',
      'Preprint server reputation',
      "Author's publication history",
      'Clear indication of peer review status',
      'Date of posting',
    ],
    'conference': [
      'Conference selectivity/reputation',
      'Peer review process quality',
      'Extended abstract detail level',
      'Author presentation quality',
      'Citation impact potential',
    ],
    'unknown': [
      'Document format and completeness',
      'Author identification',
      'Claims substantiation',
      'Logical coherence',
      'Appropriate evidence quality',
    ],
  }

  return focus[docType] || focus.unknown
}

/**
 * Get common limitations for document type and field
 */
function getTypicalLimitations(docType: DocumentType): string[] {
  const limitations: Record<DocumentType, string[]> = {
    'article': [
      'Limited to single study outcomes',
      'Generalizability constraints from sample',
      'Temporal limitations of single timepoint',
    ],
    'review': [
      'Dependent on quality of included studies',
      'Publication bias in source papers',
      'Subjective selection of sources',
      'Rapid field evolution may date review',
    ],
    'book': [
      'Lack of peer review process',
      'Single author perspective',
      'Potential outdated information',
    ],
    'dissertation': [
      'Limited publication scrutiny',
      'Focused scope for degree requirement',
      'May emphasize methodology over breadth',
    ],
    'proposal': [
      'Speculative nature of unfunded research',
      'Uncertainty in execution',
      'May overestimate feasibility',
    ],
    'case-study': [
      'Limited generalizability',
      'Potential for selection bias',
      'Subjective interpretation risk',
      'Context-dependent findings',
    ],
    'essay': [
      'Author opinion influence',
      'Limited empirical evidence',
      'Subjective argumentation',
    ],
    'theoretical': [
      'Lack of empirical validation',
      'Abstract applicability',
      'Testability limitations',
    ],
    'preprint': [
      'Lack of formal peer review',
      'Potential substantial revisions pending',
      'Uncertain publication timeline',
    ],
    'conference': [
      'Space limitations on depth',
      'Varying peer review rigor',
      'Often preliminary work',
    ],
    'unknown': [
      'Unclear publication/credibility standard',
      'Uncertain peer review status',
      'Source verification needed',
    ],
  }

  return limitations[docType] || limitations.unknown
}

/**
 * Get common assumptions for document type and field
 */
function getCommonAssumptions(field: AcademicField): string[] {
  const assumptions: Record<AcademicField, string[]> = {
    'natural-sciences': [
      'Replicability of results under controlled conditions',
      'Objectivity of measurements',
      'Universal applicability of laws discovered',
      'Predictability based on established principles',
    ],
    'engineering': [
      'Technical feasibility of proposed designs',
      'Performance predictability from models',
      'Scalability of lab results',
      'Resource availability for implementation',
    ],
    'medical': [
      'Biological mechanisms are consistent across populations',
      'Clinical outcomes correlate with biomarkers',
      'Beneficence justifies research risks',
      'Informed consent adequately protects subjects',
    ],
    'agricultural': [
      'Environmental conditions can be generalized',
      'Agricultural systems are manageable variables',
      'Economic models reflect farmer behavior',
      'Sustainability is achievable with intervention',
    ],
    'social-sciences': [
      'Human behavior is systematic and predictable',
      'Self-report data reflects actual behavior',
      'Context can be sufficiently controlled',
      'Causality can be inferred from association',
    ],
    'humanities': [
      'Texts have stable, discoverable meanings',
      'Historical sources reflect reality',
      'Interpretation can be validated',
      'Values are not entirely subjective',
    ],
    'formal-sciences': [
      'Axioms are self-evident truths',
      'Logical deduction produces certainty',
      'Infinite sets can be meaningfully discussed',
      'Proofs are indisputable once accepted',
    ],
    'interdisciplinary': [
      'Concepts translate across disciplines',
      'Methods from one field apply to another',
      'Interdisciplinary synthesis adds value',
      'Disciplinary boundaries are not essential',
    ],
  }

  return assumptions[field] || assumptions.interdisciplinary
}
