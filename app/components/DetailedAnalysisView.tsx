'use client'

import { AnalysisResult } from '@/app/types'
import { useState, useEffect } from 'react'
import { saveBookmark, removeBookmark, isBookmarked } from '@/app/lib/bookmarks'
import DocumentTypeIndicator from './DocumentTypeIndicator'
import FrameworkAssessmentView from './FrameworkAssessmentView'
import AIDisclaimerBanner from './AIDisclaimerBanner'
import { getFrameworkGuidelines } from '@/app/lib/adaptiveFramework'
import { FolderDown, X, Bookmark, Check, AlertTriangle, Shield, BarChart2, FileText, Brain, Scale, ChevronDown, ChevronUp, LayoutDashboard, Sparkles } from 'lucide-react'
import ExperimentalFeaturesView from './ExperimentalFeaturesView'

interface DetailedAnalysisViewProps {
  analysis: AnalysisResult
  onClose: () => void
}

export default function DetailedAnalysisView({ analysis, onClose }: DetailedAnalysisViewProps) {
  const [isBookmarkedState, setIsBookmarkedState] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>('all') // 'all', 'detailed', 'framework', or null
  const [showExperimental, setShowExperimental] = useState(false)

  // Handle Esc key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  // Check bookmark status on mount
  useEffect(() => {
    const checkBookmark = async () => {
      try {
        const bookmarked = await isBookmarked(analysis.paper.id)
        setIsBookmarkedState(bookmarked)
      } catch (error) {
        console.error('Error checking bookmark status:', error)
      }
    }
    checkBookmark()
  }, [analysis.paper.id])

  const handleBookmark = async () => {
    try {
      if (isBookmarkedState) {
        await removeBookmark(analysis.paper.id)
        setIsBookmarkedState(false)
      } else {
        await saveBookmark(analysis, '')
        setIsBookmarkedState(true)
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
      // Optionally add user notification here
    }
  }

  const handleExportAnalysis = () => {
    try {
      // Generate formatted text report
      const report = `RESEARCH PAPER ANALYSIS REPORT
Generated: ${new Date().toLocaleString()}
================================================================================

PAPER INFORMATION
Title: ${analysis.paper.title}
Authors: ${analysis.paper.authors.join(', ')}
Journal: ${analysis.paper.journal || 'N/A'}
Year: ${analysis.paper.year || 'N/A'}
DOI: ${analysis.paper.doi || 'N/A'}
Document Type: ${analysis.paper.documentType}
Academic Field: ${analysis.paper.field}

================================================================================
CREDIBILITY ASSESSMENT (Total: ${analysis.credibility.totalScore.toFixed(1)}/10)
Rating: ${analysis.credibility.rating}

Methodological Rigor: ${analysis.credibility.methodologicalRigor.score.toFixed(1)}/${analysis.credibility.methodologicalRigor.maxScore}
${analysis.credibility.methodologicalRigor.description}

Data Transparency: ${analysis.credibility.dataTransparency.score.toFixed(1)}/${analysis.credibility.dataTransparency.maxScore}
${analysis.credibility.dataTransparency.description}

Source Quality: ${analysis.credibility.sourceQuality.score.toFixed(1)}/${analysis.credibility.sourceQuality.maxScore}
${analysis.credibility.sourceQuality.description}

Author Credibility: ${analysis.credibility.authorCredibility.score.toFixed(1)}/${analysis.credibility.authorCredibility.maxScore}
${analysis.credibility.authorCredibility.description}

Statistical Validity: ${analysis.credibility.statisticalValidity.score.toFixed(1)}/${analysis.credibility.statisticalValidity.maxScore}
${analysis.credibility.statisticalValidity.description}

Logical Consistency: ${analysis.credibility.logicalConsistency.score.toFixed(1)}/${analysis.credibility.logicalConsistency.maxScore}
${analysis.credibility.logicalConsistency.description}

================================================================================
BIAS ANALYSIS
Overall Bias Level: ${analysis.bias.overallLevel}
${analysis.bias.justification}

Identified Biases:
${analysis.bias.biases.map(b => `- ${b.type} Bias (${b.severity}): ${b.evidence}`).join('\n')}

================================================================================
KEY FINDINGS
Research Question: ${analysis.keyFindings.researchQuestion}
${analysis.keyFindings.hypothesis ? `Hypothesis: ${analysis.keyFindings.hypothesis}` : ''}

Methodology:
- Study Design: ${analysis.keyFindings.methodology.studyDesign}
- Sample Size: ${analysis.keyFindings.methodology.sampleSize}
- Population: ${analysis.keyFindings.methodology.population}
- Setting: ${analysis.keyFindings.methodology.setting}

Primary Findings:
${analysis.keyFindings.findings.primaryFindings.map(f => `- ${f}`).join('\n')}

Limitations (${analysis.keyFindings.limitations.severity}):
${analysis.keyFindings.limitations.authorAcknowledged.map(l => `- ${l}`).join('\n')}

Conclusion: ${analysis.keyFindings.conclusions.primaryConclusion}
Supported by Data: ${analysis.keyFindings.conclusions.supportedByData ? 'Yes' : 'No'}

================================================================================
RESEARCH PERSPECTIVE
Paradigm: ${analysis.perspective.paradigm}
Theoretical Framework: ${analysis.perspective.theoreticalFramework}
Epistemological Stance: ${analysis.perspective.epistemologicalStance}
Disciplinary Perspective: ${analysis.perspective.disciplinaryPerspective}

================================================================================`

      // Download as text file
      const element = document.createElement('a')
      element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(report)}`)
      element.setAttribute('download', `${analysis.paper.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}_analysis.txt`)
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    } catch (error) {
      console.error('Error exporting analysis:', error)
    }
  }

  // Helper to determine score color
  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 90) return 'bg-green-600' // Exemplary
    if (percentage >= 70) return 'bg-green-500' // Strong
    if (percentage >= 50) return 'bg-yellow-500' // Moderate
    if (percentage >= 30) return 'bg-yellow-500' // Weak
    return 'bg-red-500' // Poor
  }

  // Helper to determine confidence badge style
  const getConfidenceBadgeColor = (confidence: string) => {
    switch (confidence) {
      case 'HIGH': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
      case 'MEDIUM': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
      case 'LOW': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
      case 'UNCERTAIN': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
    }
  }

  const toggleSection = (section: string) => {
    if (expandedSection === 'all') {
      setExpandedSection(section === 'detailed' ? 'framework' : 'detailed')
    } else if (expandedSection === section) {
      setExpandedSection(null)
    } else {
      setExpandedSection('all')
    }
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-7xl h-[100dvh] sm:h-auto sm:max-h-[90vh] bg-white dark:bg-dark-900 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border-0 sm:border border-gray-200 dark:border-dark-700">

        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 dark:border-dark-800 flex justify-between items-center bg-white dark:bg-dark-900 z-20">
          <div className="flex-1 min-w-0 mr-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate" title={analysis.paper.title}>
              {analysis.paper.title}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
              <span className="font-medium">{analysis.paper.authors[0]}</span>
              {analysis.paper.authors.length > 1 && <span>+{analysis.paper.authors.length - 1} more</span>}
              <span>•</span>
              <span>{analysis.paper.year || 'N/A'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExperimental(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors text-sm font-medium"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Labs</span>
            </button>

            <button
              onClick={handleBookmark}
              className={`p-2 rounded-xl transition-colors ${isBookmarkedState
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800'
                }`}
              title={isBookmarkedState ? 'Remove Bookmark' : 'Bookmark Analysis'}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarkedState ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleExportAnalysis}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
              title="Export Analysis"
            >
              <FolderDown className="w-5 h-5" />
            </button>

            <div className="w-px h-6 bg-gray-200 dark:bg-dark-700 mx-2"></div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Main Content Area with Sidebar */}
        <div className="flex flex-1 overflow-hidden">

          {/* Sticky Navigation Sidebar */}
          <div className="hidden lg:flex flex-col w-64 border-r border-gray-100 dark:border-dark-800 bg-gray-50/50 dark:bg-dark-900/50 p-4 space-y-2 overflow-y-auto">
            <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2">Contents</div>
            {[
              { id: 'scorecard', label: 'Overview', icon: LayoutDashboard },
              { id: 'findings', label: 'Key Findings', icon: FileText },
              { id: 'detailed', label: 'Detailed Assessment', icon: BarChart2 },
              { id: 'framework', label: 'Framework Assessment', icon: Scale },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-dark-800 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl transition-colors text-left"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white dark:bg-dark-900 scroll-smooth">

            {/* AI Disclaimer */}
            <AIDisclaimerBanner compact={true} />

            {analysis.credibility.totalScore === 0 && analysis.credibility.rating === 'Invalid' ? (
              // Global Loading State
              <div className="flex flex-col items-center justify-center h-[60vh] animate-fade-in">
                <div className="text-5xl font-bold pb-2 text-center">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
                    Loading
                  </span>
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-[length:200%_auto] animate-gradient-dot bg-clip-text text-transparent">.</span>
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-[length:200%_auto] animate-gradient-dot animate-delay-200 bg-clip-text text-transparent">.</span>
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-[length:200%_auto] animate-gradient-dot animate-delay-400 bg-clip-text text-transparent">.</span>
                </div>
              </div>
            ) : (
              // Analysis Content
              <div className="space-y-8 animate-fade-in">
                {/* Red Flag Alerts */}
                {analysis.redFlags && analysis.redFlags.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                      <h3 className="text-lg font-bold text-red-900 dark:text-red-100 truncate">Critical Issues Detected</h3>
                    </div>
                    <div className="space-y-3">
                      {analysis.redFlags.map((flag, idx) => (
                        <div key={idx} className="bg-white dark:bg-dark-900/50 p-3 rounded-xl border border-red-100 dark:border-red-900/50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-red-700 dark:text-red-300 text-sm">{flag.type.replace(/_/g, ' ')}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${flag.severity === 'CRITICAL'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}>
                              {flag.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1 line-clamp-3" title={flag.evidence}>{flag.evidence}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 italic line-clamp-2" title={flag.recommendation}>Recommendation: {flag.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* --- ROW 1: Unified Scorecard Header --- */}
                <div id="scorecard" className="bg-gray-50 dark:bg-dark-800/50 rounded-2xl p-1 border border-gray-100 dark:border-dark-700 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-dark-700">

                  {/* Credibility */}
                  <div className="p-6 flex flex-col items-center justify-center text-center">
                    <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-bold uppercase tracking-wider">Credibility Score</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-gradient-primary">{analysis.credibility.totalScore.toFixed(1)}</span>
                      <span className="text-sm text-gray-400 dark:text-gray-500 font-medium">/{analysis.credibility.maxTotalScore ? analysis.credibility.maxTotalScore.toFixed(1) : '10.0'}</span>
                    </div>
                    <div className="mt-2 inline-block px-3 py-1 rounded-full bg-white dark:bg-dark-700 shadow-sm text-xs font-bold text-gray-900 dark:text-white border border-gray-100 dark:border-dark-600">
                      {analysis.credibility.rating}
                    </div>
                  </div>

                  {/* Bias */}
                  <div className="p-6 flex flex-col items-center justify-center text-center">
                    <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
                      <AlertTriangle className={`w-4 h-4 ${analysis.bias.overallLevel === 'Low' || analysis.bias.overallLevel === 'Minimal' ? 'text-green-500' : analysis.bias.overallLevel === 'Medium' ? 'text-yellow-500' : 'text-red-500'}`} />
                      <span className="text-sm font-bold uppercase tracking-wider">Bias Risk</span>
                    </div>

                    {analysis.bias.justification === 'Analyzing...' ? (
                      // Loading State
                      <div className="flex flex-col items-center">
                        <div className="text-2xl font-bold bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
                          Analyzing...
                        </div>
                        <div className="mt-2 h-4 w-32 bg-gray-100 dark:bg-dark-700 rounded-full animate-pulse"></div>
                      </div>
                    ) : (
                      // Result State
                      <>
                        <div className={`text-2xl font-bold mb-1 ${analysis.bias.overallLevel === 'Low' || analysis.bias.overallLevel === 'Minimal' ? 'text-green-600 dark:text-green-400' :
                          analysis.bias.overallLevel === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                          {analysis.bias.overallLevel}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-4" title={analysis.bias.justification}>
                          {analysis.bias.justification}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Classification */}
                  <div className="p-6 flex flex-col items-center justify-center text-center bg-white dark:bg-transparent">
                    <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
                      <Brain className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-bold uppercase tracking-wider">Classification</span>
                    </div>
                    <div className="w-full flex justify-center">
                      <DocumentTypeIndicator
                        documentTypeString={analysis.paper.documentType}
                        field={analysis.paper.field}
                        subfield={analysis.paper.subfield}
                        domain={analysis.paper.domain}
                      />
                    </div>
                  </div>
                </div>

                {/* --- ROW 2: Findings & Context (Full Width) --- */}
                <div id="findings" className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                  {/* Key Findings (Left 2/3) */}
                  <div className="xl:col-span-2 bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-200 dark:border-dark-700 shadow-sm h-full">
                    <div className="flex items-center gap-3 mb-6">
                      <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      <h3 className="font-bold text-gray-900 dark:text-white">Key Findings & Methodology</h3>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Research Question</h4>
                        <p className="text-lg font-medium text-gray-900 dark:text-white leading-relaxed line-clamp-4" title={analysis.keyFindings.researchQuestion}>
                          {analysis.keyFindings.researchQuestion}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-dark-700/30 rounded-xl p-4">
                        {[
                          { label: 'Study Design', val: analysis.keyFindings.methodology.studyDesign },
                          { label: 'Sample Size', val: analysis.keyFindings.methodology.sampleSize },
                          { label: 'Population', val: analysis.keyFindings.methodology.population },
                          { label: 'Setting', val: analysis.keyFindings.methodology.setting },
                        ].map((item, i) => (
                          <div key={i}>
                            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{item.label}</h4>
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={item.val}>{item.val}</p>
                          </div>
                        ))}
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Primary Findings</h4>
                        <ul className="space-y-3">
                          {analysis.keyFindings.findings.primaryFindings.map((finding, i) => (
                            <li key={i} className="flex gap-3 text-gray-700 dark:text-gray-300">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0"></div>
                              <span className="leading-relaxed line-clamp-3" title={finding}>{finding}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-4 border-t border-gray-100 dark:border-dark-700">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Conclusion</h4>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${analysis.keyFindings.conclusions.supportedByData
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                            {analysis.keyFindings.conclusions.supportedByData ? 'Supported by Data' : 'Not Fully Supported'}
                          </span>
                        </div>
                        <p className="text-gray-800 dark:text-gray-200 italic border-l-4 border-primary-200 dark:border-primary-800 pl-4 py-1">
                          &quot;{analysis.keyFindings.conclusions.primaryConclusion}&quot;
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Unified Sidebar Stack (Right 1/3) */}
                  <div className="space-y-6">
                    {/* Context Card (Unified Limitations & Perspective) */}
                    <div className="bg-gray-50 dark:bg-dark-800/30 rounded-2xl border border-gray-100 dark:border-dark-700 overflow-hidden">
                      {/* Limitations Header */}
                      <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-700 bg-amber-50/50 dark:bg-amber-900/10 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <h3 className="font-bold text-amber-900 dark:text-amber-100 text-sm uppercase tracking-wide">Limitations</h3>
                        </div>
                        <span className={`font-bold px-2 py-0.5 rounded-full text-xs ml-4 ${analysis.keyFindings.limitations.severity === 'Major' ? 'bg-red-100 text-red-700' :
                          analysis.keyFindings.limitations.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                          {analysis.keyFindings.limitations.severity}
                        </span>
                      </div>

                      <div className="p-6 border-b border-gray-100 dark:border-dark-700">
                        <ul className="space-y-2">
                          {analysis.keyFindings.limitations.authorAcknowledged.map((limit, i) => (
                            <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                              <span className="text-amber-500">•</span>
                              {limit}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Perspective Header */}
                      <div className="px-6 py-3 bg-gray-100/50 dark:bg-dark-800/50 border-b border-gray-100 dark:border-dark-700">
                        <h3 className="font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Research Perspective</h3>
                      </div>

                      <div className="p-6 space-y-4">
                        {[
                          { label: 'Paradigm', val: analysis.perspective.paradigm },
                          { label: 'Epistemology', val: analysis.perspective.epistemologicalStance },
                          { label: 'Framework', val: analysis.perspective.theoreticalFramework },
                        ].map((item, i) => (
                          <div key={i}>
                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase block mb-1">{item.label}</span>
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={item.val}>{item.val}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- ROW 3: Detailed Assessment (Collapsible) --- */}
                <div id="detailed" className="bg-gray-50 dark:bg-dark-800/30 rounded-xl border border-gray-100 dark:border-dark-700 overflow-hidden transition-all duration-300">
                  <button
                    onClick={() => toggleSection('detailed')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-dark-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <BarChart2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Detailed Assessment</h3>
                    </div>
                    {expandedSection === 'detailed' || expandedSection === 'all' ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </button>

                  {(expandedSection === 'detailed' || expandedSection === 'all') && (
                    <div className="p-4 sm:p-6 pt-0 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          { key: 'methodologicalRigor', component: analysis.credibility.methodologicalRigor },
                          { key: 'dataTransparency', component: analysis.credibility.dataTransparency },
                          { key: 'sourceQuality', component: analysis.credibility.sourceQuality },
                          { key: 'authorCredibility', component: analysis.credibility.authorCredibility },
                          { key: 'statisticalValidity', component: analysis.credibility.statisticalValidity },
                          { key: 'logicalConsistency', component: analysis.credibility.logicalConsistency },
                        ].map(({ key, component }) => (
                          <div key={key} className="bg-white dark:bg-dark-800 rounded-xl p-5 border border-gray-100 dark:border-dark-700 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col group">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-bold text-gray-900 dark:text-white">{component.name}</h4>
                              <div className="flex items-center gap-2">
                                {component.confidence && (
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getConfidenceBadgeColor(component.confidence as string)}`}>
                                    {component.confidence} confidence
                                  </span>
                                )}
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${getScoreColor(component.score, component.maxScore)}`}>
                                  {component.score}/{component.maxScore}
                                </span>
                              </div>
                            </div>
                            <div className="relative group/desc flex-grow">
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed text-left">
                                {component.description}
                              </p>
                            </div>

                            {component.evidence.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-auto">
                                {component.evidence.slice(0, 2).map((e, i) => (
                                  <div key={i} className="group/tooltip relative inline-flex">
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-dark-700 text-xs text-gray-600 dark:text-gray-400 cursor-help hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors">
                                      <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                                      <span className="truncate max-w-[150px] sm:max-w-[200px] whitespace-nowrap">{e}</span>
                                    </span>
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs rounded-xl shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 pointer-events-none">
                                      <div className="font-bold mb-1">Evidence:</div>
                                      {e}
                                      <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-white"></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* --- ROW 4: Framework Assessment (Collapsible) --- */}
                {analysis.paper.documentType && analysis.paper.field && (
                  <div id="framework" className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 shadow-sm overflow-hidden">
                    <button
                      onClick={() => toggleSection('framework')}
                      className="w-full px-6 py-4 border-b border-gray-100 dark:border-dark-700 bg-gray-50 dark:bg-dark-800/50 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Scale className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <h3 className="font-bold text-gray-900 dark:text-white">Framework Assessment</h3>
                      </div>
                      {expandedSection === 'framework' || expandedSection === 'all' ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </button>

                    {(expandedSection === 'framework' || expandedSection === 'all') && (
                      <div className="p-6 animate-fade-in">
                        <FrameworkAssessmentView
                          framework={getFrameworkGuidelines(analysis.paper.documentType as any, analysis.paper.field as any)}
                          collapsed={false}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
      {/* Experimental Features Modal */}
      {showExperimental && (
        <ExperimentalFeaturesView
          analysis={analysis}
          onClose={() => setShowExperimental(false)}
        />
      )}
    </div>
  )
}
