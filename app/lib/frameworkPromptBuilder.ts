import { FrameworkGuidelines, AcademicField, DocumentType } from './adaptiveFramework'
import {
  SCORING_PHILOSOPHY,
  CALIBRATION_EXAMPLES,
  BIAS_DETECTION_GUIDE,
  RED_FLAG_DETECTION,
  AI_HONESTY_REQUIREMENTS,
  FIELD_SPECIFIC_CRITERIA,
  getOutputFormatTemplate
} from './templates/promptTemplates'

export interface FrameworkPromptContext {
  documentTitle?: string
  documentType: DocumentType
  field: AcademicField
  specificDocumentType?: string // Specific type from DOI/Metadata if available
  specificField?: string // Specific field from DOI/Metadata if available
  framework: FrameworkGuidelines
  fullText: string
  abstract?: string
}

export function buildFrameworkV2Prompt(context: FrameworkPromptContext): string {
  return `
You are implementing the Syllogos Research Evaluation Framework v2.0.
You are an expert research analyst with deep understanding of academic rigor, bias detection, and honest uncertainty acknowledgment.

${buildScoringPhilosophy()}

${buildCalibrationExamples()}

${buildComponentRubrics(context)}

${buildFieldSpecificCriteria(context.field)}

${buildBiasDetectionGuide()}

${buildRedFlagDetection()}

${buildAIHonestyRequirements()}

${buildOutputFormat(context)}

STEP 1: CLASSIFICATION VERIFICATION
Verify the assigned Document Type(${context.specificDocumentType || context.documentType}) and Field(${context.specificField || context.field}).
The provided classification may be a heuristic guess("unknown"). You MUST analyze the content to determine the authoritative Document Type and Academic Field.
Do NOT output "unknown" unless the document is completely unreadable. Infer the BEST FIT type and field based on content, structure, and intent.
Explicitly note any discrepancy in the 'classification' output field.

DOCUMENT TO ANALYZE:
  Title: ${context.documentTitle || 'Unknown'}
  Document Type: ${context.specificDocumentType || context.documentType}
  Field: ${context.specificField || context.field}

${context.fullText.substring(0, 150000)} ${context.fullText.length > 150000 ? '[... document continues ...]' : ''}

CRITICAL INSTRUCTION:
1. **Calibration**: Be conservative. A **Total Credibility Score** > 8.0 is rare. A score > 9.0 is exceptional. Perfect component scores (e.g., 2.5/2.5) require absolute proof.
2. **Speed & Structure**: The JSON is ordered to provide high-signal insights (Findings) first. Process these efficiently.
3. **Depth**: In "Credibility" and "Bias", provide deep, evidence-based reasoning. Do not be vague.
4. **Honesty**: If you cannot find something, say "Not Found" or "Uncertain". Do not hallucinate.

You MUST return ONLY valid JSON.
Do not include markdown formatting(like \`\`\`json).
Do not include any text before or after the JSON object.
Ensure all string values are properly escaped.
Begin analysis now.
`

}

function buildScoringPhilosophy(): string {
  return SCORING_PHILOSOPHY
}

function buildCalibrationExamples(): string {
  return CALIBRATION_EXAMPLES
}

function buildComponentRubrics(context: FrameworkPromptContext): string {
  return `
CREDIBILITY COMPONENTS(Total: ${(context.framework.weights.methodologicalRigor + context.framework.weights.dataTransparency + context.framework.weights.sourceQuality + context.framework.weights.authorCredibility + context.framework.weights.statisticalValidity + context.framework.weights.logicalConsistency).toFixed(1)} points):

Weights for ${context.documentType} in ${context.field}:
  - Methodological Rigor: 0 - ${context.framework.weights.methodologicalRigor}
- Data Transparency: 0 - ${context.framework.weights.dataTransparency}
- Source Quality: 0 - ${context.framework.weights.sourceQuality}
- Author Credibility: 0 - ${context.framework.weights.authorCredibility}
- Statistical Validity: 0 - ${context.framework.weights.statisticalValidity}
- Logical Consistency: 0 - ${context.framework.weights.logicalConsistency}

COMPONENT 1: METHODOLOGICAL RIGOR(0 - ${context.framework.weights.methodologicalRigor})
BEFORE SCORING THIS COMPONENT:
1. Identify what IS present
2. Give credit for strengths before deducting for weaknesses
3. Consider paper type appropriateness
4. Apply field standards
5. Default to middle of range if uncertain

COMPONENT 2: DATA TRANSPARENCY(0 - ${context.framework.weights.dataTransparency})
  - Full data sharing = max score
    - Partial data / "on request" = mid score
      - No data statement = low score

COMPONENT 3: SOURCE QUALITY(0 - ${context.framework.weights.sourceQuality})
  - Legitimate venue(peer - reviewed or reputable archive) = max score
    - Rigorous standards evident = high score
      - Predatory or unverified source = low score
        - Note: Do NOT penalize preprints solely for being preprints if they are on reputable servers(arXiv, bioRxiv, etc.)

COMPONENT 4: AUTHOR CREDIBILITY(0 - ${context.framework.weights.authorCredibility})
  - Verifiable affiliations & clear disclosures = max score
    - No history of retractions / fraud = high score
      - Missing affiliations or conflicts = low score
        - Note: Do NOT penalize for lack of fame / status.Focus on transparency.

          COMPONENT 5: STATISTICAL VALIDITY(0 - ${context.framework.weights.statisticalValidity})
            - Appropriate tests + power analysis = max score
              - Basic tests correct = mid score
                - Inappropriate / Missing stats = low score

COMPONENT 6: LOGICAL CONSISTENCY(0 - ${context.framework.weights.logicalConsistency})
  - Clear chain of reasoning = max score
    - Minor gaps = mid score
      - Contradictions = low score
        `
}

function buildFieldSpecificCriteria(field: AcademicField): string {
  return FIELD_SPECIFIC_CRITERIA[field] || FIELD_SPECIFIC_CRITERIA['interdisciplinary']
}

function buildBiasDetectionGuide(): string {
  return BIAS_DETECTION_GUIDE
}

function buildRedFlagDetection(): string {
  return RED_FLAG_DETECTION
}

function buildAIHonestyRequirements(): string {
  return AI_HONESTY_REQUIREMENTS
}

function buildOutputFormat(context: FrameworkPromptContext): string {
  return getOutputFormatTemplate(context)
}
