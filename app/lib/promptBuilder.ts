import { FrameworkGuidelines, AcademicField, DocumentType } from './adaptiveFramework'
import { DocumentChunk } from './documentProcessor'
import { buildFrameworkV2Prompt } from './frameworkPromptBuilder'

export interface PromptContext {
  documentTitle?: string
  documentType: DocumentType
  field: AcademicField
  framework: FrameworkGuidelines
  chunks: DocumentChunk[]
  fullText: string
  abstract?: string
}

/**
 * Generate a comprehensive assessment prompt for Claude
 * Adapts to document type and academic field
 */
export function buildAssessmentPrompt(context: PromptContext): string {
  // Use new Framework V2 builder
  return buildFrameworkV2Prompt({
    documentTitle: context.documentTitle,
    documentType: context.documentType,
    field: context.field,
    framework: context.framework,
    fullText: context.fullText,
    abstract: context.abstract
  })
}

// Legacy functions kept for compatibility if needed, or can be removed/refactored later
// For now, we'll keep the interface but redirect to the new builder where appropriate


// Legacy functions removed to fix build errors (unused)
// getDocumentTypeDescription and getFieldSpecificGuidance were removed as they are replaced by frameworkPromptBuilder logic


/**
 * Build a simpler prompt for when full text is unavailable (using abstract only)
 */
export function buildAbstractOnlyPrompt(
  title: string | undefined,
  abstract: string,
  documentType: DocumentType,
  field: AcademicField
): string {
  return `Analyze the following academic abstract and provide assessment based on the information available.

DOCUMENT INFORMATION:
- Title: ${title || 'Unknown'}
- Document Type: ${documentType}
- Academic Field: ${field.replace(/-/g, ' ')}

NOTE: Full document text is unavailable. Assessment is based on abstract only. Be conservative in scores - many components cannot be fully assessed from abstract alone. Indicate in evidence fields where full document review would strengthen the assessment.

ABSTRACT:
${abstract}

ANALYSIS TASK:
Provide assessment with the following JSON structure. Use best judgment where information is unavailable from abstract:

{
  "credibility": {
    "methodologicalRigor": {
      "score": <0-2.5>,
      "maxScore": 2.5,
      "description": "<assessment of methodological quality as evident from abstract>",
      "evidence": ["<evidence 1 or 'Not fully assessable from abstract'>"],
      "confidence": <0-100>,
      "reasoning": "<explain WHY - note abstract limitations>"
    },
    "dataTransparency": {
      "score": <0-1.5>,
      "maxScore": 1.5,
      "description": "<assessment of data transparency as evident from abstract>",
      "evidence": ["<evidence 1 or 'Not fully assessable from abstract'>"],
      "confidence": <0-100>,
      "reasoning": "<explain WHY>"
    },
    "sourceQuality": {
      "score": <0-2.0>,
      "maxScore": 2.0,
      "description": "<assessment of source quality as evident from abstract>",
      "evidence": ["<evidence 1 or 'Not fully assessable from abstract'>"],
      "confidence": <0-100>,
      "reasoning": "<explain WHY>"
    },
    "authorCredibility": {
      "score": <0-1.5>,
      "maxScore": 1.5,
      "description": "<assessment of author credibility as evident from abstract>",
      "evidence": ["<evidence 1 or 'Not fully assessable from abstract'>"],
      "confidence": <0-100>,
      "reasoning": "<explain WHY>"
    },
    "statisticalValidity": {
      "score": <0-1.0>,
      "maxScore": 1.0,
      "description": "<assessment of statistical approach as evident from abstract>",
      "evidence": ["<evidence 1 or 'Not fully assessable from abstract'>"],
      "confidence": <0-100>,
      "reasoning": "<explain WHY>"
    },
    "logicalConsistency": {
      "score": <0-1.5>,
      "maxScore": 1.5,
      "description": "<assessment of logical coherence as evident from abstract>",
      "evidence": ["<evidence 1 or 'Not fully assessable from abstract'>"],
      "confidence": <0-100>,
      "reasoning": "<explain WHY>"
    },
    "totalScore": <sum of above scores, should not exceed 10.0>,
    "rating": "<Exemplary|Strong|Moderate|Weak|Very Poor|Invalid>",
    "overallConfidence": <0-100>
  },
  "bias": {
    "biases": [
      {
        "type": "<Selection|Confirmation|Publication|Reporting|Funding|Citation|Demographic|Measurement>",
        "evidence": "<evidence from abstract or 'Not assessable from abstract'>",
        "severity": "<Low|Medium|High>",
        "confidence": <0-100>,
        "verifiable": <true|false>
      }
    ],
    "overallLevel": "<Low|Medium|High>",
    "justification": "<synthesis of identified biases, noting abstract limitations>"
  },
  "keyFindings": {
    "fundamentals": {
      "title": "${title || 'Unknown'}",
      "authors": ["<author names if available>"],
      "journal": "<source if available>",
      "doi": "<DOI if available>",
      "publicationDate": "<YYYY-MM-DD or 'Unknown'>",
      "articleType": "${documentType}"
    },
    "researchQuestion": "<research question from abstract>",
    "hypothesis": "<hypothesis if stated in abstract>",
    "methodology": {
      "studyDesign": "<design type from abstract or 'Not specified'>",
      "sampleSize": "<sample size from abstract or 'Not specified'>",
      "population": "<target population from abstract or 'Not specified'>",
      "samplingMethod": "<method from abstract or 'Not specified'>",
      "setting": "<setting from abstract or 'Not specified'>",
      "intervention": "<intervention if applicable or 'Not specified'>",
      "comparisonGroups": "<groups if mentioned or 'Not specified'>",
      "outcomesMeasures": ["<outcome from abstract or 'Not specified'>"],
      "statisticalMethods": ["<method from abstract or 'Not specified'>"],
      "studyDuration": "<duration from abstract or 'Not specified'>"
    },
    "findings": {
      "primaryFindings": ["<main findings from abstract>"],
      "secondaryFindings": ["<secondary findings if any>"],
      "effectSizes": ["<effect sizes if reported>"],
      "clinicalSignificance": "<significance as stated in abstract>",
      "unexpectedFindings": ["<unexpected results if any>"]
    },
    "limitations": {
      "authorAcknowledged": ["<limitations mentioned in abstract>"],
      "methodologicalIdentified": ["<limitations identifiable from abstract>"],
      "severity": "<Minor|Moderate|Major|Not assessable from abstract>"
    },
    "conclusions": {
      "primaryConclusion": "<main conclusion from abstract>",
      "supportedByData": <true|false>,
      "practicalImplications": ["<implications stated or derived>"],
      "futureResearchNeeded": ["<suggestions from abstract>"],
      "recommendations": ["<recommendations if any>"],
      "generalizability": "<generalizability as discussed or 'Not assessable from abstract'>"
    }
  },
  "perspective": {
    "theoreticalFramework": "<framework mentioned or 'Not specified'>",
    "paradigm": "<Positivist|Interpretivist|Critical|Pragmatic|Not clear>",
    "disciplinaryPerspective": "<apparent disciplinary tradition>",
    "epistemologicalStance": "<knowledge perspective if evident>",
    "assumptions": {
      "stated": ["<stated assumptions>"],
      "unstated": ["<apparent assumptions or 'Not assessable from abstract'>"]
    },
    "ideologicalPosition": "<ideological stance if detectable>",
    "authorReflexivity": "<reflection evident in abstract or 'Not evident'>",
    "context": {
      "geographic": "<geographic context if mentioned>",
      "temporal": "<temporal context if mentioned>",
      "institutional": "<institutional context if mentioned>"
    }
  },
  "limitations": {
    "unverifiableClaims": [
      {
        "claim": "<claim that cannot be verified from abstract>",
        "reason": "<why it cannot be verified - likely 'Not available in abstract'>",
        "section": "<which component: credibility, bias, keyFindings, or perspective>"
      }
    ],
    "dataLimitations": [
      "Analysis based on abstract only - full document review would strengthen assessment",
      "Methodology details cannot be fully evaluated from abstract",
      "Statistical analysis cannot be verified from abstract alone"
    ],
    "uncertainties": ["<areas where confidence is below 70% due to abstract limitations>"],
    "aiConfidenceNote": "This analysis is based on abstract only. Confidence in credibility assessment is limited. Review of full document would enable more robust evaluation of methodology, data transparency, statistical validity, and actual results."
  }
}

CRITICAL INSTRUCTIONS:
1. Return ONLY valid JSON, no additional text before or after
2. Note in evidence fields: "Not assessable from abstract" or "Not specified" where appropriate
3. Be conservative with scores - acknowledge abstract limitations
4. totalScore must not exceed 10.0
5. Each component score must stay within its maxScore`
}
