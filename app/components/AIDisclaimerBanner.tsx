'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'

interface AIDisclaimerBannerProps {
  compact?: boolean
}

export default function AIDisclaimerBanner({ compact = false }: AIDisclaimerBannerProps) {
  const [isExpanded, setIsExpanded] = useState(!compact)

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Info size={20} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100">AI-Generated Analysis</h3>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200 transition-colors font-medium"
            >
              {isExpanded ? 'Less' : 'More'}
            </button>
          </div>
          <p className="text-sm text-blue-800 dark:text-blue-200 mt-1 leading-relaxed">
            This analysis is AI-generated supplementary guidance, not professional expertise. Always verify findings with domain experts.
          </p>

          {isExpanded && (
            <div className="mt-3 space-y-2 text-xs text-blue-800 dark:text-blue-200 border-t border-blue-200 dark:border-blue-800 pt-3">
              <p>
                <span className="font-bold text-blue-900 dark:text-blue-100">Confidence Levels:</span> Look for the percentage badges - higher confidence (80%+) means more reliable assessment.
              </p>
              <p>
                <span className="font-bold text-blue-900 dark:text-blue-100">Show Your Work:</span> The reasoning section explains why each score was given and what evidence supports it.
              </p>
              <p>
                <span className="font-bold text-blue-900 dark:text-blue-100">&quot;I Don&apos;t Know&quot;:</span> Claims marked as unverifiable indicate areas where the AI cannot reliably assess the paper.
              </p>
              <p>
                <span className="font-bold text-blue-900 dark:text-blue-100">Limitations:</span> Abstract-only analysis is inherently limited. Full document review strengthens all assessments.
              </p>
              <p className="italic text-blue-700 dark:text-blue-300">
                This tool analyzes research credibility to help identify potential issues, but should not replace human expert judgment, peer review, or critical evaluation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
