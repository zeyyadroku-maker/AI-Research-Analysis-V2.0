# AI Research Analysis Platform

## Deployment

### Deploy to Vercel

1.  **Push to GitHub**: Ensure your code is pushed to a GitHub repository.
2.  **Import Project**: Go to [Vercel](https://vercel.com/), click "Add New...", and select "Project". Import your GitHub repository.
3.  **Configure Environment Variables**:
    *   In the "Environment Variables" section of the deployment setup, add the following:
        *   `CLAUDE_API_KEY`: Your Anthropic Claude API Key.
4.  **Deploy**: Click "Deploy". Vercel will build and deploy your application.

### Local Development

An AI-powered research paper analysis platform that helps you understand credibility, detect bias, and evaluate research quality with intelligent insights.

## Features

- 🔍 **Search Research Papers**: Search from the OpenAlex database with millions of papers
- 🤖 **AI-Powered Analysis**: Uses Claude API to analyze papers using a comprehensive adaptive framework
- 📊 **Credibility Assessment**: Evaluates papers on methodological rigor, transparency, source quality, author credentials, statistical validity, and logical consistency (0-10 scale)
- ⚠️ **Bias Detection**: Identifies multiple types of bias including selection, confirmation, publication, reporting, funding, citation, demographic, and measurement bias
- 📈 **Key Findings Extraction**: Automatically extracts research fundamentals, methodology, findings, limitations, and conclusions
- 📚 **Bookmark Papers**: Save your favorite analyses for later review
- 🎨 **Beautiful UI**: Modern, responsive design with smooth animations inspired by contemporary design patterns

## Tech Stack

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS v3
- **APIs**:
  - OpenAlex API (paper database)
  - Anthropic Claude API (LLM analysis)
- **State Management**: React hooks with localStorage for bookmarks

## Prerequisites

- Node.js 18.17 or later
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
cd research-analysis
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file in the project root with your API keys:
```bash
# Copy from .env.example and fill in your actual keys
CLAUDE_API_KEY=sk-ant-...
```

> **Note**: Never commit `.env.local` to git. Add your actual API keys only in the local `.env.local` file.

## Running the Application

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Usage

1. **Search Papers**: Use the search bar on the homepage to find research papers by topic, author, or keywords
2. **View Results**: Papers appear as cards with basic information
3. **Analyze**: Click the "Analyze" button on any paper to run the full AI analysis
4. **Review Analysis**: The analysis includes:
   - Credibility score with breakdown by component
   - Identified biases and their severity
   - Key research findings and methodology
   - Research perspective and theoretical framework
5. **Bookmark**: Save papers you find interesting using the bookmark button
6. **View Bookmarks**: Access your saved papers from the Bookmarks page

## Project Structure

```
app/
├── api/
│   ├── search/          # CORE API search endpoint
│   └── analyze/         # Groq LLM analysis endpoint
├── components/
│   ├── SearchBar.tsx    # Search interface
│   ├── ResultsCard.tsx  # Paper result cards
│   └── DetailedAnalysisView.tsx  # Full analysis modal
├── lib/
│   └── bookmarks.ts     # Bookmark management utilities
├── types/
│   └── index.ts         # TypeScript type definitions
├── bookmarks/
│   └── page.tsx         # Bookmarks page
├── page.tsx             # Home page
└── globals.css          # Global styles
```

## API Endpoints

### POST /api/search
Searches for papers using the OpenAlex API.

**Query Parameters:**
- `q` (required): Search query
- `page` (optional): Page number (default: 1)

**Response:**
```json
{
  "papers": [{ paper objects }],
  "totalHits": number,
  "hasMore": boolean,
  "currentPage": number
}
```

### POST /api/analyze
Analyzes a paper using the Claude API with the comprehensive adaptive framework.

**Request Body:**
```json
{
  "paper": { paper object },
  "fullText": "Paper content or abstract"
}
```

**Response:**
```json
{
  "paper": { paper object },
  "credibility": { credibility assessment },
  "bias": { bias analysis },
  "keyFindings": { extracted findings },
  "perspective": { research perspective },
  "timestamp": "ISO timestamp"
}
```

## Analysis Framework

The AI analysis uses a comprehensive framework that includes:

### Credibility Assessment (0-10)
1. Methodological Rigor (0-2.5)
2. Data Transparency (0-2)
3. Source Quality (0-1.5)
4. Author Credibility (0-1.5)
5. Statistical Validity (0-1.5)
6. Logical Consistency (0-1)

### Bias Detection
- Selection Bias
- Confirmation Bias
- Publication Bias
- Reporting Bias
- Funding Bias
- Citation Bias
- Demographic Bias
- Measurement Bias

### Key Findings Extraction
- Research fundamentals
- Research questions and hypotheses
- Methodology details
- Primary and secondary findings
- Limitations and severity assessment
- Conclusions and implications

### Research Perspective
- Theoretical framework
- Epistemological stance
- Research assumptions
- Ideological positioning
- Author positionality
- Contextual information

## Customization

### Update API Keys
Create or edit `.env.local` with your API keys (never commit this file):
```bash
# Required for Claude API analysis
CLAUDE_API_KEY=sk-ant-...

# Optional - for future features
# OPENAI_API_KEY=sk-...
```
See `.env.example` for the template format.

### Styling
- Tailwind configuration: `tailwind.config.ts`
- Global styles: `app/globals.css`
- Color scheme is defined in the Tailwind config

### LLM Model
To change the Claude model, update `app/api/analyze/route.ts`:
```typescript
model: 'claude-3-5-haiku-20241022', // Change this line
```
See [Anthropic documentation](https://docs.anthropic.com/claude/reference/getting-started-with-the-api) for available models.

## Performance Considerations

- Papers are fetched on-demand from OpenAlex API
- Analysis requests are sent to Claude API (may take a few seconds)
- Bookmarks are stored in browser localStorage
- Consider implementing pagination for large search results

## Limitations

- Analysis quality depends on Claude API capabilities
- Full-text document analysis is available when full text is provided
- Bookmarks are stored locally in the browser (not synced across devices)
- OpenAlex API may have rate limits

## Future Enhancements

- [ ] Full-text PDF parsing for complete paper analysis
- [ ] Database backend for persistent bookmark storage
- [ ] User accounts and authentication
- [ ] Advanced filtering by bias level, credibility score, etc.
- [ ] Comparison view for multiple papers
- [ ] Export analysis as PDF
- [ ] Community annotations and ratings
- [ ] Advanced search filters
- [ ] Research collaboration features

## Troubleshooting

### API Keys Not Working
- Verify the API keys are correct in `.env.local`
- Check if the APIs are accessible from your network
- Try regenerating the API keys from the provider dashboards

### Slow Analysis
- Claude API analysis can take 10-30 seconds per paper
- This is normal behavior for comprehensive analysis
- Consider implementing a progress bar for better UX

### No Search Results
- Try simpler search terms
- Check the OpenAlex API is responsive
- Verify you have internet connectivity

## License

MIT License - feel free to use this project for personal and commercial purposes.

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## Support

For issues and questions, please open an issue on the GitHub repository.
