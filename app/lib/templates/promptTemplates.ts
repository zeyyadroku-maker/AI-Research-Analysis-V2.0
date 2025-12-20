import { FrameworkPromptContext } from '../frameworkPromptBuilder'
import { AcademicField } from '../adaptiveFramework'

export const SCORING_PHILOSOPHY = `
SCORING CALIBRATION PRINCIPLES (READ THIS FIRST):

1. GIVE CREDIT FOR WHAT EXISTS
   - Evaluate what IS present, don't just penalize gaps
   - Example: Review paper without original data should NOT score 0 on transparency
   - Instead: Score based on transparency about sources reviewed

2. PAPER TYPE MATTERS
   - Empirical vs. Review vs. Theoretical = different standards
   - Don't apply RCT standards to history papers

3. FIELD CONTEXT MATTERS
   - Natural sciences: Reproducibility focus
   - Humanities: Source quality focus
   - Different epistemologies = different standards

4. REALISTIC DISTRIBUTION
   Most legitimate published research scores 6-8/10:
   - 9.0-10.0 (EXEMPLARY): Top 5%
   - 7.5-8.9 (STRONG): Top 30% ← MOST GOOD PAPERS HERE
   - 6.0-7.4 (MODERATE): Middle 40%
   - 4.0-5.9 (WEAK): Lower 20%
   - 2.0-3.9 (POOR): Bottom 4%
   - 0-1.9 (INVALID): Bottom 1%

5. DEFAULT TO MIDDLE WHEN UNCERTAIN
   - If unsure, score near middle of range
   - Only extreme scores when confident

6. "UNCERTAIN" FOR CANNOT ASSESS
   Use "UNCERTAIN" ONLY when:
   - Critical info completely missing
   - Novel methods requiring expertise you lack
   - Genuinely cannot assess
   
   NOT for:
   - "Some gaps" (score lower, explain gaps)
   - Different field (apply field adaptations)

7. DESCRIPTION LENGTH CONSISTENCY
   - Descriptions for credibility components MUST be between 40-50 words.
   - Ensure descriptions are concise but comprehensive.
   - This is critical for UI consistency.
`

export const CALIBRATION_EXAMPLES = `
CALIBRATION EXAMPLES:

Example 1: Strong Research (Nature NumPy paper)
- Type: Methods paper, CS field, Nature journal
- Expected: 8.8/10 (STRONG)
- Methodological Rigor: 1.8/2.5 (descriptive, not validation study)
- Data Transparency: 2.0/2.0 (fully open source - perfect)
- Source Quality: 1.5/1.5 (Nature, peer-reviewed)
- Author Credibility: 1.5/1.5 (established experts)
- Statistical Validity: 1.0/1.5 (descriptive stats only)
- Logical Consistency: 1.0/1.0 (accurate claims)

Example 2: Adequate Preprint (arXiv)
- Type: Empirical preprint, CS field
- Expected: 7.2/10 (MODERATE)
- Would score 7.5-8.0 after peer review

Example 3: Weak Study
- Type: Empirical, social sciences
- Expected: 4.5/10 (WEAK)
- Convenience sample, no validated instruments, poor transparency
`

export const BIAS_DETECTION_GUIDE = `
BIAS DETECTION GUIDE:

Look for these specific bias types:
1. Selection Bias: Sample doesn't represent population
2. Confirmation Bias: Only seeking evidence that supports hypothesis
3. Publication Bias: Only reporting positive results
4. Reporting Bias: Selective reporting of outcomes
5. Funding Bias: Sponsor influence on study design/results
6. Citation Bias: Only citing supportive literature
7. Demographic Bias: Ignoring specific groups (gender, race, etc.)
8. Measurement Bias: Flawed tools or metrics
`

export const RED_FLAG_DETECTION = `
RED FLAG DETECTION (Mandatory Reporting):

Trigger a RED FLAG if you detect:
1. FUNDING_BIAS: Industry funding + favorable conclusions without safeguards
2. PREDATORY_JOURNAL: Signs of predatory publishing (no peer review, etc.)
3. STATISTICAL_ANOMALY: p-hacking signs, impossible statistics
4. MISSING_ETHICS: No IRB/Ethics approval for human/animal studies
5. INTERNAL_CONTRADICTION: Conclusions contradict results
6. NOVEL_HIGH_STAKES: New dangerous methods without safety checks

For each red flag, assign severity: CRITICAL, HIGH, MEDIUM, or WARNING.
`

export const AI_HONESTY_REQUIREMENTS = `
AI HONESTY & LIMITATIONS:

You MUST report:
1. cannotAssess: List specific aspects you genuinely cannot evaluate (e.g., "Clinical appropriateness of protocol")
2. requiresExpertReview: Specific areas needing human validation (e.g., "Novel statistical method validation")
3. uncertaintyAreas: Where your confidence is low
`

export const FIELD_SPECIFIC_CRITERIA: Record<AcademicField, string> = {
  'natural-sciences': `
NATURAL SCIENCES EVALUATION CRITERIA:

Priority Focus:
- Methodological Rigor: CRITICAL
- Data Transparency: CRITICAL
- Reproducibility: Essential

What Makes Research Credible:
- Experimental controls clearly described
- Measurement precision reported
- Equipment calibration documented
- Sample characteristics specified
- Error propagation calculated
- Independent replication achieved

Scoring Guide for Methodological Rigor:
- Top Tier: Gold standard (RCT equivalent, full controls, power analysis)
- High Tier: Strong (sound design, mostly rigorous, minor gaps)
- Mid Tier: Adequate (basic design sound, some issues)
- Low Tier: Weak (significant problems)
- Bottom Tier: Poor/Invalid
`,
  'engineering': `
ENGINEERING/CS EVALUATION CRITERIA:

Priority Focus:
- Methodological Rigor: CRITICAL
- Practical Applicability: HIGH
- Reproducibility (Code/Data): CRITICAL

What Makes Research Credible:
- Code available and runnable
- Benchmarks against SOTA
- Ablation studies included
- Real-world constraints considered
- Scalability analysis provided
`,
  'medical': `
MEDICAL SCIENCES EVALUATION CRITERIA:

Priority Focus:
- Methodological Rigor: CRITICAL
- Ethical Compliance: MANDATORY
- Statistical Validity: CRITICAL

What Makes Research Credible:
- Pre-registration of study
- Clear inclusion/exclusion criteria
- Randomization and blinding
- Power analysis for sample size
- Conflict of interest fully disclosed
`,
  'social-sciences': `
SOCIAL SCIENCES EVALUATION CRITERIA:

Priority Focus:
- Methodological Rigor: HIGH
- Construct Validity: HIGH
- Sampling Strategy: HIGH

What Makes Research Credible:
- Representative sampling
- Validated instruments used
- Control for confounding variables
- Robust qualitative analysis (if applicable)
- Reflexivity acknowledged
`,
  'humanities': `
HUMANITIES EVALUATION CRITERIA:

Priority Focus:
- Source Quality: CRITICAL
- Logical Consistency: CRITICAL
- Argument Coherence: HIGH

What Makes Research Credible:
- Primary sources used extensively
- Contextualization is deep and accurate
- Counter-arguments addressed
- Theoretical framework clear
- Interpretations grounded in evidence
`,
  'formal-sciences': `
FORMAL SCIENCES (MATH/LOGIC) EVALUATION CRITERIA:

Priority Focus:
- Logical Consistency: CRITICAL
- Proof Correctness: CRITICAL
- Novelty: HIGH

What Makes Research Credible:
- Proofs are complete and correct
- Axioms clearly stated
- Definitions are precise
- Theorems follow logically
- Edge cases considered
`,
  'agricultural': `
AGRICULTURAL SCIENCES EVALUATION CRITERIA:

Priority Focus:
- Methodological Rigor: HIGH
- Environmental Control: HIGH
- Replicability: HIGH

What Makes Research Credible:
- Field trial design (randomized block etc.)
- Environmental variables recorded
- Multi-season/location data
- Economic viability considered
- Statistical analysis appropriate for field data
`,
  'interdisciplinary': `
INTERDISCIPLINARY EVALUATION CRITERIA:

Priority Focus:
- Integration: HIGH
- Methodological Appropriateness: HIGH
- Coherence: HIGH

What Makes Research Credible:
- Methods from different fields used correctly
- Integration creates new insight
- Terminology used consistently
- Limitations of each field acknowledged
- Synthesis is logical
`
}

export function getOutputFormatTemplate(context: FrameworkPromptContext): string {
  return `
OUTPUT FORMAT:
Return ONLY valid JSON with this structure.

CRITICAL INSTRUCTIONS FOR TEXT GENERATION:
1. STRICTLY ADHERE to the maximum character counts specified in the comments (e.g., MAX 150 CHARACTERS).
2. DO NOT TRUNCATE text or use ellipses ("..."). The generated content MUST be complete grammatical sentences that naturally fit within the limit.
3. Be concise and direct. Focus on the most important information.
4. If a thought is too long, rewrite it to be shorter rather than cutting it off.
5. These limits are for UI compatibility - breaking them will break the user interface.

{
  "classification": {
    "documentType": "string",
    "field": "string",
    "confidence": "HIGH" | "MEDIUM" | "LOW" | "UNCERTAIN"
  },
  "credibility": {
    "methodologicalRigor": {
      "score": number,
      "maxScore": ${context.framework.weights.methodologicalRigor},
      "description": "string (MAX 150 CHARACTERS)",
      "evidence": ["string (MAX 100 CHARACTERS EACH)"],
      "confidence": "HIGH" | "MEDIUM" | "LOW" | "UNCERTAIN",
      "reasoning": "string",
      "limitations": ["string"]
    },
    "dataTransparency": {
      "score": number,
      "maxScore": ${context.framework.weights.dataTransparency},
      "description": "string (MAX 150 CHARACTERS)",
      "evidence": ["string (MAX 100 CHARACTERS EACH)"],
      "confidence": "HIGH" | "MEDIUM" | "LOW" | "UNCERTAIN",
      "reasoning": "string",
      "limitations": ["string"]
    },
    "sourceQuality": {
      "score": number,
      "maxScore": ${context.framework.weights.sourceQuality},
      "description": "string (MAX 150 CHARACTERS)",
      "evidence": ["string (MAX 100 CHARACTERS EACH)"],
      "confidence": "HIGH" | "MEDIUM" | "LOW" | "UNCERTAIN",
      "reasoning": "string",
      "limitations": ["string"]
    },
    "authorCredibility": {
      "score": number,
      "maxScore": ${context.framework.weights.authorCredibility},
      "description": "string (MAX 150 CHARACTERS)",
      "evidence": ["string (MAX 100 CHARACTERS EACH)"],
      "confidence": "HIGH" | "MEDIUM" | "LOW" | "UNCERTAIN",
      "reasoning": "string",
      "limitations": ["string"]
    },
    "statisticalValidity": {
      "score": number,
      "maxScore": ${context.framework.weights.statisticalValidity},
      "description": "string (MAX 150 CHARACTERS)",
      "evidence": ["string (MAX 100 CHARACTERS EACH)"],
      "confidence": "HIGH" | "MEDIUM" | "LOW" | "UNCERTAIN",
      "reasoning": "string",
      "limitations": ["string"]
    },
    "logicalConsistency": {
      "score": number,
      "maxScore": ${context.framework.weights.logicalConsistency},
      "description": "string (MAX 150 CHARACTERS)",
      "evidence": ["string (MAX 100 CHARACTERS EACH)"],
      "confidence": "HIGH" | "MEDIUM" | "LOW" | "UNCERTAIN",
      "reasoning": "string",
      "limitations": ["string"]
    },
    "totalScore": number,
    "rating": "string",
    "overallConfidence": "HIGH" | "MEDIUM" | "LOW" | "UNCERTAIN"
  },
  "bias": {
    "biases": [
      {
        "type": "string",
        "evidence": "string (MAX 120 CHARACTERS)",
        "severity": "Low" | "Medium" | "High",
        "confidence": "HIGH" | "MEDIUM" | "LOW" | "UNCERTAIN",
        "verifiable": boolean,
        "impact": "string",
        "mitigation": "string"
      }
    ],
    "overallLevel": "Low" | "Medium" | "High",
    "overallConfidence": "HIGH" | "MEDIUM" | "LOW" | "UNCERTAIN",
    "justification": "string (MAX 250 CHARACTERS)"
  },
  "keyFindings": {
    "fundamentals": {
      "title": "string",
      "authors": ["string"],
      "journal": "string",
      "doi": "string",
      "publicationDate": "string",
      "articleType": "string"
    },
    "researchQuestion": "string (MAX 200 CHARACTERS)",
    "hypothesis": "string (MAX 200 CHARACTERS)",
    "methodology": {
      "studyDesign": "string (MAX 50 CHARACTERS)",
      "sampleSize": "string (MAX 50 CHARACTERS)",
      "population": "string (MAX 80 CHARACTERS)",
      "samplingMethod": "string",
      "setting": "string (MAX 80 CHARACTERS)",
      "intervention": "string",
      "comparisonGroups": "string",
      "outcomesMeasures": ["string"],
      "statisticalMethods": ["string"],
      "studyDuration": "string"
    },
    "findings": {
      "primaryFindings": ["string (MAX 150 CHARACTERS EACH)"],
      "secondaryFindings": ["string"],
      "effectSizes": ["string"],
      "clinicalSignificance": "string",
      "unexpectedFindings": ["string"]
    },
    "limitations": {
      "authorAcknowledged": ["string (MAX 100 CHARACTERS EACH)"],
      "methodologicalIdentified": ["string"],
      "severity": "Minor" | "Moderate" | "Major"
    },
    "conclusions": {
      "primaryConclusion": "string (MAX 300 CHARACTERS)",
      "supportedByData": boolean,
      "practicalImplications": ["string"],
      "futureResearchNeeded": ["string"],
      "recommendations": ["string"],
      "generalizability": "string"
    }
  },
  "perspective": {
    "theoreticalFramework": "string (MAX 100 CHARACTERS)",
    "paradigm": "string (MAX 50 CHARACTERS)",
    "disciplinaryPerspective": "string (MAX 100 CHARACTERS)",
    "epistemologicalStance": "string (MAX 80 CHARACTERS)",
    "assumptions": {
      "stated": ["string"],
      "unstated": ["string"]
    },
    "ideologicalPosition": "string",
    "authorReflexivity": "string",
    "context": {
      "geographic": "string",
      "temporal": "string",
      "institutional": "string"
    }
  },
  "redFlags": [
    {
      "type": "string",
      "description": "string",
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "WARNING",
      "evidence": "string (MAX 150 CHARACTERS)",
      "requiresAction": "string",
      "recommendation": "string (MAX 150 CHARACTERS)",
      "requiresHumanReview": boolean
    }
  ],
  "aiLimitations": {
    "cannotAssess": ["string"],
    "requiresExpertReview": ["string"],
    "uncertaintyAreas": ["string"],
    "requiredExpertise": ["string"],
    "missingInformation": ["string"],
    "confidenceNote": "string"
  },
  "humanReview": {
    "priority": "MANDATORY" | "STANDARD" | "OPTIONAL",
    "reason": "string",
    "suggestedExperts": ["string"],
    "specificAreas": ["string"],
    "expertiseRequired": ["string"]
  },
  "limitations": {
    "unverifiableClaims": [
      {
        "claim": "string",
        "reason": "string",
        "section": "string"
      }
    ],
    "dataLimitations": ["string"],
    "uncertainties": ["string"],
    "aiConfidenceNote": "string"
  }
}
`
}
