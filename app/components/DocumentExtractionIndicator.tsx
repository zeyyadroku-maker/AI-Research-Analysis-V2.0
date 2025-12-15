'use client'

interface DocumentExtractionIndicatorProps {
  extracted: boolean
  source?: 'arxiv' | 'doi' | 'unpaywall' | 'openalex' | 'direct' | 'provided'
  size?: number
  format?: 'pdf' | 'text' | 'abstract'
}

const sourceInfo: Record<string, { label: string; icon: string; color: string; description: string }> = {
  arxiv: {
    label: 'arXiv',
    icon: '🔬',
    color: 'bg-red-500',
    description: 'Full PDF from arXiv repository',
  },
  doi: {
    label: 'DOI/Crossref',
    icon: '📎',
    color: 'bg-blue-500',
    description: 'Full document from DOI registry',
  },
  unpaywall: {
    label: 'Unpaywall',
    icon: '🔓',
    color: 'bg-green-500',
    description: 'Open access version via Unpaywall',
  },
  openalex: {
    label: 'OpenAlex',
    icon: '🌐',
    color: 'bg-cyan-500',
    description: 'PDF link from OpenAlex',
  },
  direct: {
    label: 'Direct URL',
    icon: '🔗',
    color: 'bg-purple-500',
    description: 'Document from direct link',
  },
  provided: {
    label: 'Provided Text',
    icon: '📝',
    color: 'bg-amber-500',
    description: 'Text provided with request',
  },
}

const formatLabels: Record<string, string> = {
  pdf: 'PDF Document',
  text: 'Text Extraction',
  abstract: 'Abstract Only',
}

export default function DocumentExtractionIndicator({
  extracted,
  source = 'provided',
  size,
  format = 'text',
}: DocumentExtractionIndicatorProps) {
  const info = sourceInfo[source] || sourceInfo.provided

  if (!extracted) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4 mb-4 flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">⚠️</div>
        <div>
          <h4 className="font-semibold text-yellow-200 mb-1">Full Document Not Available</h4>
          <p className="text-sm text-yellow-100">
            Analysis based on abstract only. Full document retrieval from arXiv, DOI registry, or Unpaywall was unsuccessful.
            Credibility assessment may be more limited without full text.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">{info.icon}</div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-white">{info.label}</h4>
              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">Extracted</span>
            </div>
            <p className="text-sm text-gray-300 mb-2">{info.description}</p>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              {format && (
                <div className="flex items-center gap-1">
                  <span className="text-primary-500">•</span>
                  {formatLabels[format] || format}
                </div>
              )}
              {size && (
                <div className="flex items-center gap-1">
                  <span className="text-primary-500">•</span>
                  {(size / 1024 / 1024).toFixed(2)} MB
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={`w-12 h-12 rounded-full ${info.color} flex items-center justify-center text-white flex-shrink-0`}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
