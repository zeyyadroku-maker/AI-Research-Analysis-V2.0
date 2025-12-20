'use client'

import { FrameworkGuidelines } from '@/app/lib/adaptiveFramework'

interface FrameworkAssessmentViewProps {
  framework: FrameworkGuidelines
  collapsed?: boolean
}

const scoreColor = (score: number, maxScore: number): string => {
  const percentage = (score / maxScore) * 100

  if (percentage >= 90) return 'bg-green-600'
  if (percentage >= 70) return 'bg-green-500'
  if (percentage >= 50) return 'bg-yellow-500'
  if (percentage >= 30) return 'bg-orange-500'
  return 'bg-red-500'
}

export default function FrameworkAssessmentView({
  framework,
  collapsed = false,
}: FrameworkAssessmentViewProps) {
  const weights = framework.weights
  const totalScore = Object.values(weights).reduce((a, b) => a + b, 0)

  return (
    <div className="bg-gray-50 dark:bg-dark-800/30 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-dark-700">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Assessment Framework</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Adaptive weights for <span className="font-medium text-gray-700 dark:text-gray-300">{framework.documentType}</span> in <span className="font-medium text-gray-700 dark:text-gray-300">{framework.field.replace(/-/g, ' ')}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-dark-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-600 shadow-sm">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Max Score</span>
          <span className={`text-xl font-bold ${totalScore <= 4 ? 'text-red-600 dark:text-red-400' : totalScore <= 7 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
            {totalScore.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Weights Vertical Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Methodological Rigor', score: weights.methodologicalRigor, max: 2.5, desc: 'Evaluates the robustness of the research design, sampling methods, and control of variables.' },
          { label: 'Data Transparency', score: weights.dataTransparency, max: 2.0, desc: 'Assesses the availability of raw data, clarity of data collection procedures, and replicability.' },
          { label: 'Source Quality', score: weights.sourceQuality, max: 1.5, desc: 'Reviews the reputation of the journal, citation impact, and peer-review status.' },
          { label: 'Author Credibility', score: weights.authorCredibility, max: 1.5, desc: 'Considers author expertise, affiliations, and potential conflicts of interest.' },
          { label: 'Statistical Validity', score: weights.statisticalValidity, max: 1.5, desc: 'Checks for appropriate statistical tests, sample size sufficiency, and correct interpretation of results.' },
          { label: 'Logical Consistency', score: weights.logicalConsistency, max: 1.0, desc: 'Ensures the arguments follow a logical progression and conclusions are supported by the premises.' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-dark-800 rounded-xl p-5 border border-gray-100 dark:border-dark-700 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-base font-bold text-gray-900 dark:text-white">{item.label}</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{item.score}</span>
                <span className="text-sm text-gray-400 dark:text-gray-500">/{item.max}</span>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed flex-grow line-clamp-4" title={item.desc}>
              {item.desc}
            </p>

            <div className="w-full bg-gray-100 dark:bg-dark-700 rounded-full h-2 mt-auto">
              <div
                className={`h-2 rounded-full ${scoreColor(item.score, item.max)}`}
                style={{ width: `${(item.score / item.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {!collapsed && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-700 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bias Assessment Priorities */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Primary Bias Concerns</h4>
            <div className="space-y-3">
              {framework.biasPriorities.map((bias, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm bg-white dark:bg-dark-800 p-3 rounded-lg border border-gray-100 dark:border-dark-700">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium pt-0.5">{bias}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Assessment Focus Areas */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Focus Areas</h4>
            <div className="space-y-3">
              {framework.assessmentFocus.map((focus, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm bg-white dark:bg-dark-800 p-3 rounded-lg border border-gray-100 dark:border-dark-700">
                  <span className="text-primary-500 font-bold text-lg leading-none">•</span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{focus}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
