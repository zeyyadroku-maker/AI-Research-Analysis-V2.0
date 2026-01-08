import type { FrameworkPromptContext } from '../frameworkPromptBuilder'
import { AcademicField } from '../adaptiveFramework'

export const SCORING_PHILOSOPHY = `
## SCORING CALIBRATION
1. **Credit Existing Work**: Score what is present. A review paper isn't transparent about raw data but can be about sources.
2. **Context Matters**: Standards vary by type (Review vs Empirical) and field.
3. **Distribution**: 9-10 (Exemplary, Top 5%), 7.5-8.9 (Strong, Top 30%), 6-7.4 (Moderate), 4-5.9 (Weak), <4 (Poor).
4. **Uncertainty**: Default to middle if unsure. Use "UNCERTAIN" only for genuinely missing critical info, not just "some gaps".
5. **Conciseness**: Descriptions MUST be 30-40 words.
`

export const CALIBRATION_EXAMPLES = `
## CALIBRATION EXAMPLES
- **Strong (Nature CS)**: 8.8/10. Open source code (2/2), established experts (1.5/1.5). Descriptive stats only (1/1.5).
- **Adequate Preprint**: 7.2/10. Solid but needs review.
- **Weak**: 4.5/10. Convenience sample, opaque methods.
`

export const BIAS_DETECTION_GUIDE = `
## BIAS DETECTION
Check for:
1. **Selection**: Sample != Population.
2. **Confirmation**: Seeking only supporting evidence.
3. **Publication/Reporting**: Only positive results reported.
4. **Funding/Demographic**: Sponsor influence or ignoring groups.
`

export const RED_FLAG_DETECTION = `
## RED FLAGS (Mandatory)
Trigger RED FLAG & Severity (CRITICAL/HIGH/MEDIUM) if:
- **Funding Bias**: Industry funded + favorable result w/o safeguards.
- **Predatory**: No peer review signs.
- **Statistical**: Impossible stats/p-hacking.
- **Ethics**: Missing IRB.
- **Contradiction**: Conclusion != Results.
`

export const AI_HONESTY_REQUIREMENTS = `
## AI HONESTY
Report:
- **cannotAssess**: Genuinely unassessable aspects.
- **requiresExpertReview**: Needs human validation.
- **uncertaintyAreas**: Low confidence areas.
`

export const FIELD_SPECIFIC_CRITERIA: Record<AcademicField, string> = {
  'natural-sciences': `
## NATURAL SCIENCES
- **Critical**: Methodological Rigor, Data Transparency, Reproducibility.
- **Credible**: Experiments controlled, precision reported, error calculated, independent replication.
`,
  'engineering': `
## ENGINEERING/CS
- **Critical**: Rigor, Applicability, Reproducibility (Code/Data).
- **Credible**: Runnable code, SOTA benchmarks, ablation studies, scalability breakdown.
`,
  'medical': `
## MEDICAL
- **Critical**: Rigor, Ethics, Statistics.
- **Credible**: Pre-registration, clear inclusion/exclusion, randomization/blinding, power analysis, COI disclosure.
`,
  'social-sciences': `
## SOCIAL SCIENCES
- **Critical**: Rigor, Construct Validity, Sampling.
- **Credible**: Representative sample, validated instruments, confounding controls, reflexivity.
`,
  'humanities': `
## HUMANITIES
- **Critical**: Source Quality, Logic, coherence.
- **Credible**: Primary sources, deep contextualization, counter-arguments addressed.
`,
  'formal-sciences': `
## FORMAL SCIENCES (MATH)
- **Critical**: Logic, Proof Correctness.
- **Credible**: Complete proofs, precise definitions, edge cases considered.
`,
  'agricultural': `
## AGRICULTURAL
- **Critical**: Rigor, Environmental Control, Replicability.
- **Credible**: Field design (randomized block), multi-season data, economic viability.
`,
  'interdisciplinary': `
## INTERDISCIPLINARY
- **Critical**: Integration, Method Appropriateness.
- **Credible**: Correct cross-field methods, logical synthesis, consistent terminology.
`,
  'unknown': `
## GENERAL RESEARCH
- **Critical**: Clarity, Logic, Sources.
- **Credible**: Supported claims, traceable evidence, clear perspective.
`
}

export function getOutputFormatTemplate(context: FrameworkPromptContext): string {
  return `
## OUTPUT FORMAT
Return ONLY valid JSON:
{
  "classification": {
    "documentType": "string",
    "field": "string",
    "confidence": "HIGH/MEDIUM/LOW/UNCERTAIN"
  },
  "credibility": {
    "methodologicalRigor": { "score": number, "maxScore": ${context.framework.weights.methodologicalRigor}, "description": "string", "evidence": ["string"], "confidence": "string", "reasoning": "string", "limitations": ["string"] },
    "dataTransparency": { "score": number, "maxScore": ${context.framework.weights.dataTransparency}, "description": "string", "evidence": ["string"], "confidence": "string", "reasoning": "string", "limitations": ["string"] },
    "sourceQuality": { "score": number, "maxScore": ${context.framework.weights.sourceQuality}, "description": "string", "evidence": ["string"], "confidence": "string", "reasoning": "string", "limitations": ["string"] },
    "authorCredibility": { "score": number, "maxScore": ${context.framework.weights.authorCredibility}, "description": "string", "evidence": ["string"], "confidence": "string", "reasoning": "string", "limitations": ["string"] },
    "statisticalValidity": { "score": number, "maxScore": ${context.framework.weights.statisticalValidity}, "description": "string", "evidence": ["string"], "confidence": "string", "reasoning": "string", "limitations": ["string"] },
    "logicalConsistency": { "score": number, "maxScore": ${context.framework.weights.logicalConsistency}, "description": "string", "evidence": ["string"], "confidence": "string", "reasoning": "string", "limitations": ["string"] },
    "totalScore": number,
    "rating": "string",
    "overallConfidence": "string"
  },
  "bias": {
    "biases": [{ "type": "string", "evidence": "string", "severity": "Low/Medium/High", "confidence": "string", "verifiable": boolean, "impact": "string", "mitigation": "string" }],
    "overallLevel": "Low/Medium/High",
    "overallConfidence": "string",
    "justification": "string"
  },
  "keyFindings": {
    "fundamentals": { "title": "string", "authors": ["string"], "journal": "string", "doi": "string", "publicationDate": "string", "articleType": "string" },
    "researchQuestion": "string",
    "hypothesis": "string",
    "methodology": { "studyDesign": "string", "sampleSize": "string", "population": "string", "samplingMethod": "string", "setting": "string", "intervention": "string", "comparisonGroups": "string", "outcomesMeasures": ["string"], "statisticalMethods": ["string"], "studyDuration": "string" },
    "findings": { "primaryFindings": ["string"], "secondaryFindings": ["string"], "effectSizes": ["string"], "clinicalSignificance": "string", "unexpectedFindings": ["string"] },
    "limitations": { "authorAcknowledged": ["string"], "methodologicalIdentified": ["string"], "severity": "Minor/Moderate/Major" },
    "conclusions": { "primaryConclusion": "string", "supportedByData": boolean, "practicalImplications": ["string"], "futureResearchNeeded": ["string"], "recommendations": ["string"], "generalizability": "string" }
  },
  "perspective": {
    "theoreticalFramework": "string",
    "paradigm": "string",
    "disciplinaryPerspective": "string",
    "epistemologicalStance": "string",
    "assumptions": { "stated": ["string"], "unstated": ["string"] },
    "ideologicalPosition": "string",
    "authorReflexivity": "string",
    "context": { "geographic": "string", "temporal": "string", "institutional": "string" }
  },
  "redFlags": [{ "type": "string", "description": "string", "severity": "CRITICAL/HIGH/MEDIUM/WARNING", "evidence": "string", "requiresAction": "string", "recommendation": "string", "requiresHumanReview": boolean }],
  "aiLimitations": { "cannotAssess": ["string"], "requiresExpertReview": ["string"], "uncertaintyAreas": ["string"], "requiredExpertise": ["string"], "missingInformation": ["string"], "confidenceNote": "string" },
  "humanReview": { "priority": "MANDATORY/STANDARD/OPTIONAL", "reason": "string", "suggestedExperts": ["string"], "specificAreas": ["string"], "expertiseRequired": ["string"] },
  "limitations": { "unverifiableClaims": [{ "claim": "string", "reason": "string", "section": "string" }], "dataLimitations": ["string"], "uncertainties": ["string"], "aiConfidenceNote": "string" }
}
`
}
