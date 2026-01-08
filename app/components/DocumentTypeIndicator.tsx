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

  let fieldDisplay = effectiveField || effectiveSubfield || domain || 'Unspecified Field'

  // Format field display: remove dashes, title case
  if (fieldDisplay && fieldDisplay !== 'Unspecified Field') {
    fieldDisplay = fieldDisplay
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Determine display label:
  // 1. If we have a mapped label, use it.
  // 2. If not, and we have a raw string that isn't 'unknown', usage that (Title Case it).
  // 3. If strictly 'unknown', show nothing or "Unspecified" (per user request to not show "Unknown").

  let displayLabel = docInfo.label
  let displayColor = docInfo.color

  if (!documentTypeLabels[docTypeKey] && docTypeKey !== 'unknown') {
    // Use the raw string if available and valid
    displayLabel = docTypeKey.charAt(0).toUpperCase() + docTypeKey.slice(1).replace(/-/g, ' ')
    displayColor = 'bg-blue-500' // Default color for custom types
  } else if (docTypeKey === 'unknown') {
    // User says: "If the system cannot confidently determine a Type, the field must be left intentionally empty or marked as unavailable"
    // But also "never display 'Unknown'".
    displayLabel = 'Unavailable'
    displayColor = 'bg-gray-300 dark:bg-gray-600'
  }

  if (compact) {
    return (
      <div className="flex gap-2 items-center flex-wrap">
        <span
          className={`px-3 py-1 rounded text-xs font-semibold text-white ${displayColor} flex-shrink-0`}
          title={displayLabel}
        >
          {displayLabel}
        </span>
        <span className="px-3 py-1 rounded text-xs font-semibold bg-gray-600 text-white break-words max-w-full" title={fieldDisplay}>
          {fieldDisplay}
        </span>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Type */}
      <div className="flex items-start justify-between py-2 border-b border-gray-100 dark:border-dark-600/50 last:border-0">
        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex-shrink-0 mr-4 mt-1">Type</div>
        <div className="flex items-start justify-end gap-2 text-right min-w-0 flex-1">
          <div className={`w-2.5 h-2.5 rounded-full ${displayColor} flex-shrink-0 shadow-sm ring-1 ring-white dark:ring-dark-800 mt-1.5`}></div>
          <span className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed break-words text-right">
            {displayLabel}
          </span>
        </div>
      </div>

      {/* Field */}
      {(fieldDisplay !== 'Multidisciplinary' || field === 'interdisciplinary') && fieldDisplay !== 'Unspecified Field' && (
        <div className="flex items-start justify-between py-2">
          <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex-shrink-0 mr-4 mt-1">Field</div>
          <div className="flex items-start justify-end gap-2 text-right min-w-0 flex-1">
            <div className="w-2.5 h-2.5 rounded-full bg-primary-500 flex-shrink-0 shadow-sm ring-1 ring-white dark:ring-dark-800 mt-1.5"></div>
            <span className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed break-words text-right">
              {fieldDisplay}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
