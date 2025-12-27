'use client'

import { DocumentType } from '@/app/lib/adaptiveFramework'

interface DocumentTypeIndicatorProps {
  documentType?: DocumentType
  documentTypeString?: string // Direct document type from OpenAlex
  field?: string // OpenAlex field (takes precedence)
  subfield?: string // OpenAlex subfield
  domain?: string // OpenAlex domain
  compact?: boolean
}

const documentTypeLabels: Record<string, { label: string; color: string }> = {
  article: { label: 'Research Article', color: 'bg-blue-500' },
  review: { label: 'Literature Review', color: 'bg-purple-500' },
  book: { label: 'Book', color: 'bg-amber-500' },
  dissertation: { label: 'Dissertation', color: 'bg-indigo-500' },
  proposal: { label: 'Research Proposal', color: 'bg-cyan-500' },
  'case-study': { label: 'Case Study', color: 'bg-green-500' },
  essay: { label: 'Essay', color: 'bg-pink-500' },
  theoretical: { label: 'Theoretical Work', color: 'bg-yellow-500' },
  preprint: { label: 'Preprint', color: 'bg-red-500' },
  conference: { label: 'Conference Paper', color: 'bg-teal-500' },
  unknown: { label: 'Unknown Type', color: 'bg-gray-500' },
}

export default function DocumentTypeIndicator({
  documentType,
  documentTypeString,
  field,
  subfield,
  domain,
  compact = false,
}: DocumentTypeIndicatorProps) {
  const docTypeKey = documentTypeString || documentType || 'unknown'
  const docInfo = documentTypeLabels[docTypeKey] || documentTypeLabels.unknown

  // Use OpenAlex field if available, otherwise show domain/subfield
  // Convert 'unknown' to null for display logic
  const effectiveField = (field && field !== 'unknown') ? field : null
  const effectiveSubfield = (subfield && subfield !== 'unknown') ? subfield : null

  const fieldDisplay = effectiveField || effectiveSubfield || domain || 'Multidisciplinary'

  if (compact) {
    return (
      <div className="flex gap-2 items-center">
        <span
          className={`px-3 py-1 rounded text-xs font-semibold text-white ${docInfo.color}`}
          title={docInfo.label}
        >
          {docInfo.label}
        </span>
        <span className="px-3 py-1 rounded text-xs font-semibold bg-gray-600 text-white" title={fieldDisplay}>
          {fieldDisplay}
        </span>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-dark-700 rounded-lg p-6 mb-4 border border-gray-200 dark:border-dark-600">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-dark-600 pb-2">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Document Classification</h4>
          {/* Removed OpenAlex label as it may be AI generated */}
        </div>

        {/* Type */}
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${docInfo.color}`}></div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{docInfo.label}</span>
          </div>
        </div>

        {/* Field - Only show if we have some info or if it's not unknown/unspecified */}
        {(fieldDisplay !== 'Multidisciplinary' || field === 'interdisciplinary') && (
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Field</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-500"></div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{fieldDisplay}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
