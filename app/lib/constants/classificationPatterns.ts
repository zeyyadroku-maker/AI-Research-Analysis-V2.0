export const DOCUMENT_TYPE_PATTERNS = {
    preprint: [/preprint|arxiv|not peer-reviewed|eprint/],
    conference: [/\b(conference|proceeding|workshop|symposium|proceedings|conference paper|conference abstract)\b/],
    dissertation: [/\b(dissertation|thesis|doctoral dissertation|master.?s thesis|phd dissertation)\b/],
    book: [/\b(book|chapter|volume|edited collection|edited book|textbook|monograph)\b/],
    caseStudy: [/\b(case study|case analysis|case report|case presentation|single case|case example)\b/],
    proposal: [/\b(proposal|propose|proposed|propose to|proposal for|aims to|objectives|will conduct|research plan)\b/],
    essay: [/\b(essay|perspective|opinion|commentary|editorial|viewpoint|reflective essay|critical essay)\b/],
    theoretical: [/\b(theory|theoretical|conceptual|theoretical framework|concept|model|philosophical|conceptual model)\b/],
    review: [/\b(review|survey|systematic review|meta-analysis|scoping review|narrative review|literature review|examination of|synthesis of literature|state of the art)\b/],
}

export const ACADEMIC_FIELD_PATTERNS = {
    'natural-sciences': [
        /\b(physics|chemistry|biology|quantum|molecular|atomic|particle|astronomy|astrophysics|geology|botany|zoology|oceanography|mineralogy|petrology|seismology|meteorology)\b/,
        /\b(nuclei|electron|photon|energy|wavelength|frequency|atom|molecule|organic|inorganic|reaction|compound|isotope|element|mineral|rock|fossil|species|organism|cell|gene|protein|dna|enzyme|metabolism|photosynthesis|evolution|natural selection)\b/
    ],
    'engineering': [
        /\b(engineering|software|algorithm|circuit|mechanical|electrical|civil|computer science|programming|coding|database|system|network|automation|manufacturing|construction|infrastructure|hardware|firmware|application|framework|api|framework|design pattern|agile|devops|cloud)\b/,
        /\b(mechanical|structural|thermal|fluid|stress|strength|load|efficiency|optimization|control|signal|processing|encryption|architecture|module|component|integration|testing|deployment|scalability)\b/
    ],
    'medical': [
        /\b(medical|clinical|pharmaceutical|medicine|health|disease|patient|treatment|diagnosis|therapy|surgery|nursing|hospital|prescription|medication|drug|vaccine|infection|inflammation|symptom|pathology|anatomy|physiology|oncology|cardiology|neurology|psychiatry|dermatology|pediatrics|geriatrics)\b/,
        /\b(therapeutic|intervention|efficacy|safety|adverse event|complication|prognosis|remission|relapse|comorbidity|biomarker|clinical trial|randomized controlled|double blind|placebo|cohort|retrospective|prospective|case control)\b/
    ],
    'agricultural': [
        /\b(agriculture|environmental|climate|forestry|fisheries|sustainable|conservation|ecology|ecosystem|crop|soil|water|pollution|biodiversity|habitat|species protection|renewable|green|carbon|emission|environmental impact|sustainability)\b/,
        /\b(agricultural practice|farming|livestock|irrigation|pest management|soil quality|water quality|watershed|endangered|conservation strategy|environmental assessment|climate change impact|ecological restoration)\b/
    ],
    'social-sciences': [
        /\b(psychology|sociology|economics|political|anthropology|behavior|society|social|culture|institution|demographic|survey|questionnaire|interview|participant|respondent|statistical analysis|correlation|regression|hypothesis testing|sample|population|variables)\b/,
        /\b(cognitive|emotion|motivation|perception|learning|memory|personality|development|relationship|family|group|organization|management|leadership|decision making|economic theory|market|trade|finance|political system|governance|law|education|welfare)\b/
    ],
    'humanities': [
        /\b(history|philosophy|literature|language|linguistics|humanities|art|culture|civilization|classic|ancient|medieval|renaissance|period|era|dynasty|empire|author|poet|writer|literary|linguistic|semantic|syntax|dialect|etymology|translation)\b/,
        /\b(historical context|philosophical argument|literary analysis|linguistic structure|cultural meaning|artistic expression|interpretation|critique|textual|manuscript|archive|historical document|cultural heritage|intellectual history|moral theory|aesthetics|hermeneutics)\b/
    ],
    'formal-sciences': [
        /\b(mathematics|mathematical|geometry|algebra|logic|statistics|formal|proof|theorem|axiom|equation|calculus|topology|set theory|number theory|abstract algebra|linear algebra|group theory|ring theory|field theory|probability|distribution|hypothesis test|confidence interval|variance|covariance)\b/,
        /\b(mathematical model|algorithm analysis|computational complexity|theorem proving|formal verification|discrete mathematics|combinatorics|graph theory|function|mapping|transformation|sequence|series|limit|derivative|integral|matrix|vector|eigenvalue|optimization|constraint satisfaction)\b/
    ]
}

export const STRUCTURE_PATTERNS = {
    abstract: /abstract/,
    methodology: /method|procedure|approach|design|protocol|experiment|test|sample|variable|hypothesis/,
    results: /result|finding|outcome|data|show|demonstrate|evidence|conclude/,
    discussion: /discussion|implication|limitation|interpret|analyse|analyze|significance/,
    conclusion: /conclusion|summary|concluding|conclude|final remark|future work|implication/,
    introduction: /introduction/
}
