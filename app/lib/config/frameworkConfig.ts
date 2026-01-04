import { DocumentType, AcademicField, FrameworkWeights } from '../adaptiveFramework'

export const COMPONENT_MAX_SCORES = {
    methodologicalRigor: 2.5,
    dataTransparency: 2.0,
    sourceQuality: 1.5,
    authorCredibility: 1.5,
    statisticalValidity: 1.5,
    logicalConsistency: 1.0,
}

export const BASE_WEIGHTS: Record<DocumentType, FrameworkWeights> = {
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

export const FIELD_ADJUSTMENTS: Record<AcademicField, Partial<FrameworkWeights>> = {
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
        logicalConsistency: 0.0,
    },
    'formal-sciences': {
        logicalConsistency: 0.0,
        statisticalValidity: 0.2,
    },
    'interdisciplinary': {},
    'unknown': {},
}

export const BIAS_PRIORITIES: Record<AcademicField, string[]> = {
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
    'unknown': [
        'Unclear disciplinary standards',
        'Undefined methodological expectations',
        'Ambiguous context',
    ],
}

export const ASSESSMENT_FOCUS: Record<DocumentType, string[]> = {
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

export const TYPICAL_LIMITATIONS: Record<DocumentType, string[]> = {
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

export const COMMON_ASSUMPTIONS: Record<AcademicField, string[]> = {
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
    'unknown': [
        'Basic academic standards apply',
        'Claims require evidence',
        'Logic must be consistent',
    ],
}
