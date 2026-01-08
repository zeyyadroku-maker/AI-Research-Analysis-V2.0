import type { FrameworkPromptContext } from '../frameworkPromptBuilder'
import { AcademicField } from '../adaptiveFramework'

export const SCORING_PHILOSOPHY = `
## SCORING PHILOSOPHY & CALIBRATION
1. **Conservative by Default**: Start from a neutral baseline (6/10). Scores above 8.0 require EXCEPTIONAL evidence. Scores above 9.0 are reserved for transformative, flawless work.
2. **Burden of Proof**: Do not give the benefit of the doubt for missing information. If a critical methodological detail is missing, penalize it. "Implied" rigor is not sufficient.
3. **Evidence-Based Scoring**:
   - **8.0 - 10.0**: Must cite specific, verifiable evidence (data transparency, open code, rigorous controls) that exceeds standard practices.
   - **6.0 - 7.9**: Meets standard field requirements with minor flaws or standard opacity.
   - **< 6.0**: Significant missing information, methodological flaws, or lack of transparency.
4. **Contextual Calibration**: Evaluate relative to the specifically identified exact Document Type and Field. A "review" paper needs rigorous search strategy/synthesis, not new experiments.
5. **Justification is Mandarin**: Low or High scores must be explicitly justified with "Why".
6. **Depth over Conciseness**: Do NOT restrict reasoning to 30-40 words. Provide as much depth as necessary to fully justify the score and critique.
`

export const CALIBRATION_EXAMPLES = `
## CALIBRATION EXAMPLES
- **Inflated (Incorrect)**: "8.5/10. The study is well-conducted." (Too vague, score too high for generic praise)
- **Calibrated (Correct)**: "6.5/10. The study design is standard. While the sample size is adequate (N=400), the lack of pre-registration and raw data availability prevents a higher score."
- **High Score (Correct)**: "9.2/10. Exemplary rigor. Full pre-registration (OSF linked), open data/code provided, and multi-center replication included. Power analysis justifies N=1200."
- **Low Score (Correct)**: "4.0/10. Critical flaw: The conclusion claims causality from a purely observational design without controlling for obvious confounders."
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
Return ONLY valid JSON.
**CRITICAL**: "evidence" arrays must contain specific quotes or data points. "reasoning" must explain *why* the evidence leads to the score, noting specific strengths/weaknesses.

{
  "classification": {
    "documentType": "string",
    "field": "string",
    "confidence": "HIGH/MEDIUM/LOW/UNCERTAIN"
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

