# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AI Research Analysis Platform** - A Next.js 15 application that analyzes academic research papers using Claude API. The system classifies papers by document type and academic field, then applies adaptive assessment frameworks to evaluate credibility, detect bias, and extract key findings.

**Key Technologies**: Next.js 15, React 19, TypeScript, Tailwind CSS, Claude API, OpenAlex API

## Development Commands

```bash
# Install dependencies
npm install

# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Environment Variables

Create `.env.local` in project root (never commit this file):
```bash
# Required: Anthropic Claude API key
CLAUDE_API_KEY=sk-ant-...
```

Get API key from: https://console.anthropic.com/account/billing/overview

**Note**: `.env.example` shows legacy variables (no longer used: `NEXT_PUBLIC_CORE_API_KEY`, `NEXT_PUBLIC_GROQ_API_KEY`). The system migrated from CORE API + Groq to OpenAlex API + Claude API.

## Architecture & Data Flow

### Core Analysis Pipeline

1. **Search** (`app/api/search/route.ts`):
   - Queries OpenAlex API for papers
   - Transforms OpenAlex format to internal `Paper` type
   - Includes document type and field extraction from OpenAlex metadata

2. **Classification** (`app/lib/adaptiveFramework.ts`):
   - `classifyDocumentType()` - Detects document type from content (article, review, preprint, dissertation, etc.)
   - `classifyAcademicField()` - Detects field via keyword scoring (natural-sciences, engineering, medical, etc.)
   - Document classification is keyword-based, works even with partial content

3. **Document Processing** (`app/lib/documentProcessor.ts`):
   - `processPdfDocument()` - Extracts text from PDFs (uses pdf-parse)
   - `processTextDocument()` - Processes plain text documents
   - Returns structured text with metadata preservation

4. **Document Fetching** (`app/lib/documentFetcher.ts`):
   - Attempts to fetch full documents from multiple sources (arXiv, direct URLs, etc.)
   - Falls back gracefully if full text unavailable

5. **Analysis** (`app/api/analyze/route.ts`):
   - Builds adaptive prompts via `app/lib/promptBuilder.ts`
   - Uses document classification to select appropriate assessment framework
   - Calls Claude API to generate JSON analysis
   - Returns comprehensive `AnalysisResult` with credibility, bias, findings, perspective

### Type System

All types in `app/types/index.ts`:
- `Paper` - Core paper metadata from search
- `AnalysisResult` - Complete analysis output (credibility, bias, findings, perspective)
- `CredibilityScore` - 6-component assessment (methodological rigor, data transparency, source quality, author credibility, statistical validity, logical consistency)
- `BiasAnalysis` - Identifies 8 bias types with severity levels
- `KeyFindings` - Structured extraction of research fundamentals, methodology, findings, limitations, conclusions
- `ResearchPerspective` - Theoretical framework, epistemological stance, assumptions, context

## Adaptive Framework System

The framework (`app/lib/adaptiveFramework.ts`) is central to analysis quality:

### Document Types
- **article** - Empirical research with methodology and results
- **review** - Literature synthesis and meta-analysis
- **book** - Monographs and edited collections
- **dissertation** - Doctoral/master theses
- **proposal** - Research proposals and unfunded research plans
- **case-study** - Single case analysis
- **essay** - Opinion/commentary pieces
- **theoretical** - Theory and conceptual papers
- **preprint** - Unreviewed preprints (arXiv, etc.)
- **conference** - Conference proceedings and papers
- **unknown** - Fallback for unclassifiable documents

### Academic Fields
- natural-sciences, engineering, medical, agricultural, social-sciences, humanities, formal-sciences, interdisciplinary

### Credibility Weights
Each document type has different weight distributions (totaling 10.0 points):
- Articles emphasize methodological rigor (2.5) and statistical validity (1.5)
- Reviews emphasize source quality (2.5)
- Essays emphasize logical consistency (2.5)
- Theoretical papers emphasize logical consistency (3.0)
- Field-specific adjustments applied on top of base weights

When modifying analysis quality, adjust weights in `getWeightsForCombination()` or bias priorities in `getBiasPriorities()`.

## API Route Structure

### `GET /api/search`
- Query parameters:
  - `q` (required): Search term
  - `page` (optional): Page number (default: 1)
  - `author` (optional): Filter by author name
  - `fromYear` (optional): Filter papers from this year
  - `toYear` (optional): Filter papers to this year
- Returns paginated papers from OpenAlex with metadata
- Handles pagination with `currentPage` and `hasMore` flags
- Uses OpenAlex polite pool (includes User-Agent header)

### `POST /api/analyze`
- Request body: `{ paper: Paper, fullText?: string }`
- Attempts to fetch full document if text not provided
- Returns complete `AnalysisResult` as JSON
- Claude API model: `claude-3-5-haiku-20241022`

### `POST /api/upload`
- Handles document upload for direct analysis
- Supports PDF, TXT, and DOCX files
- Processes documents through the same pipeline as searched papers
- Returns extracted text and metadata for subsequent analysis

## Component Structure

### Core Components
- `SearchBar.tsx` - Search input interface with filters
- `ResultsCard.tsx` - Individual paper result display with bookmark functionality
- `DetailedAnalysisView.tsx` - Full analysis modal/view
- `FrameworkAssessmentView.tsx` - Credibility assessment visualization
- `PaginationBar.tsx` - Search pagination controls
- `Navigation.tsx` - Main navigation bar with dark/light mode toggle
- `FileUploadTab.tsx` - Document upload interface for direct file analysis
- `AIDisclaimerBanner.tsx` - Disclaimer banner for AI-generated content

### Supporting Components
- `DocumentTypeIndicator.tsx` - Visual indicator for document type classification
- `DocumentExtractionIndicator.tsx` - Shows whether analysis used full text or abstract only

### Pages
- `page.tsx` (root) - Main search and analysis interface
- `bookmarks/page.tsx` - Saved papers dashboard
- `insights/page.tsx` - Insights and analytics view

### Providers
- `ThemeProvider.tsx` - Dark/light mode theme management

### Utilities
- `app/lib/bookmarks.ts` - Bookmark state management using localStorage
- `app/lib/scoreUtils.ts` - Score calculation utilities for credibility assessment

## Important Implementation Details

### Prompt Generation
Two strategies in `promptBuilder.ts`:
- **Full Framework Prompt** - Used when text >1000 chars; includes comprehensive assessment instructions
- **Abstract-Only Prompt** - Used for abstracts only; simplified framework

The prompt instructs Claude to return valid JSON only (no surrounding text). Analysis endpoint extracts JSON with regex: `/\{[\s\S]*\}/`.

### Document Type Classification Heuristics
Classification uses regex patterns on combined title + content:
- Checks for explicit markers (e.g., "preprint", "dissertation")
- Analyzes structure patterns (abstract, methodology, results, discussion sections)
- Falls back to content length if structure unclear
- Returns 'article' as default for substantial academic content

### Field Classification Scoring
Scoring algorithm:
1. Tests keywords from each field category (3 points for primary keywords, 1 point for secondary)
2. Ranks fields by cumulative score
3. Returns single field if top score significantly higher (>2 points) than second
4. Returns 'interdisciplinary' if multiple fields score competitively

### Error Handling in Analysis
- Missing API key returns 500 status with "Claude API key not configured" message
- Document fetch failures fall back to abstract gracefully
- PDF processing errors fall back to text processing
- JSON parsing failures caught and logged with raw response
- All errors include descriptive messages for frontend

### ID Generation
- Paper IDs are generated using deterministic hash from title+DOI via `hashString()` in search route
- Ensures consistent IDs across searches for same paper
- Format: `paper-{hash}` where hash is base36 encoded

### OpenAlex Integration
- Uses polite pool by including User-Agent header with contact email
- No API key required for OpenAlex
- Author search performs two-stage lookup: first finds author ID, then filters works by that ID
- Year filters converted to OpenAlex date format (from_publication_date, to_publication_date)

### Dark/Light Mode Theme
- Theme managed by `ThemeProvider.tsx` using React Context
- Theme state persisted in localStorage
- Toggle available in `Navigation.tsx` component
- Tailwind classes use `dark:` prefix for dark mode styling
- Theme applies globally across all pages and components

### Document Processing Pipeline
Document processing happens in `app/lib/documentProcessor.ts`:
1. **PDF Processing** (`processPdfDocument`): Uses `pdf-parse` library to extract text from PDF buffers
2. **Text Processing** (`processTextDocument`): Processes plain text documents with metadata
3. **DOCX Processing**: Uses `docx` library (via jszip) to extract text from Word documents
4. Returns `DocumentChunk[]` structure with sections, page numbers, and metadata
5. Chunks are used by prompt builder to structure context for Claude API

Document fetching (`app/lib/documentFetcher.ts`):
- Attempts multiple sources: arXiv, DOI redirects, direct URLs, OpenAlex links
- Returns buffer with MIME type and source information
- Gracefully falls back if document unavailable

## Testing Recommendations

- Test document classification with mixed-field papers
- Verify framework weight adjustments don't break scoring ceiling (10.0)
- Check API response parsing for edge cases (empty abstracts, malformed JSON)
- Validate bias detection triggers appropriate keywords
- Confirm pagination limits (default 10 papers per page in OpenAlex)

## Known Limitations & Future Work

- Document fetching only attempts common sources; may miss some papers
- Abstract-only analysis is inherently limited vs. full text
- Bookmarks are browser-local only (no backend persistence)
- OpenAlex API rate limits not explicitly handled (polite pool used)
- PDF extraction quality varies by paper format

Future enhancements in README:
- Full-text PDF parsing improvements
- Database backend for persistent bookmarks
- User authentication
- Advanced filtering and comparison views
- Export to PDF functionality
