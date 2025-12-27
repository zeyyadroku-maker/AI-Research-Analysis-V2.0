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

  const fieldDisplay = effectiveField || effectiveSubfield || domain || 'Unspecified Field'

  // If type is unknown, fallback to "Pending Analysis" if it seems appropriate, or just show the label
  const displayLabel = docTypeKey === 'unknown' ? 'Pending Analysis...' : docInfo.label
  const displayColor = docTypeKey === 'unknown' ? 'bg-gray-400 animate-pulse' : docInfo.color

  if (compact) {
    return (
      <div className="flex gap-2 items-center">
        <span
          className={`px-3 py-1 rounded text-xs font-semibold text-white ${displayColor} flex-shrink-0`}
          title={displayLabel}
        >
          {displayLabel}
        </span>
        <span className="px-3 py-1 rounded text-xs font-semibold bg-gray-600 text-white truncate max-w-[150px]" title={fieldDisplay}>
          {fieldDisplay}
        </span>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Type */}
      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-dark-600/50 last:border-0">
        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex-shrink-0 mr-4">Type</div>
        <div className="flex items-center gap-2 text-right min-w-0">
          <div className={`w-2.5 h-2.5 rounded-full ${displayColor} flex-shrink-0 shadow-sm ring-1 ring-white dark:ring-dark-800`}></div>
          <span className="text-sm font-bold text-gray-900 dark:text-white truncate leading-tight">{displayLabel}</span>
        </div>
      </div>

      {/* Field */}
      {(fieldDisplay !== 'Multidisciplinary' || field === 'interdisciplinary') && fieldDisplay !== 'Unspecified Field' && (
        <div className="flex items-center justify-between py-2">
          <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex-shrink-0 mr-4">Field</div>
          <div className="flex items-center gap-2 text-right min-w-0">
            <div className="w-2.5 h-2.5 rounded-full bg-primary-500 flex-shrink-0 shadow-sm ring-1 ring-white dark:ring-dark-800"></div>
            <span className="text-sm font-bold text-gray-900 dark:text-white truncate leading-tight">{fieldDisplay}</span>
          </div>
        </div>
      )}
    </div>
  )
}
