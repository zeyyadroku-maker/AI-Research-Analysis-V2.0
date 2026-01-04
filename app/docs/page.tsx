'use client'

import Navigation from '../components/Navigation'
import Link from 'next/link'

export default function Docs() {
  return (
    <main className="min-h-screen bg-white dark:bg-dark-900 transition-colors">
      <Navigation onLogoClick={() => window.location.href = '/'} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Documentation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Everything you need to get started with Syllogos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Getting Started */}
          <div className="border border-gray-200 dark:border-dark-700 rounded-lg p-8 bg-white dark:bg-dark-800">
            <svg className="w-12 h-12 text-primary-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Quick Start</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Get up and running in minutes. Learn how to search, upload, and analyze your first paper.
            </p>
            <Link href="#" className="text-primary-600 hover:underline font-semibold">
              Read guide →
            </Link>
          </div>

          {/* Understanding Analysis */}
          <div className="border border-gray-200 dark:border-dark-700 rounded-lg p-8 bg-white dark:bg-dark-800">
            <svg className="w-12 h-12 text-primary-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Analysis Guide</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Understand credibility scores, bias detection, and confidence levels in depth.
            </p>
            <Link href="#" className="text-primary-600 hover:underline font-semibold">
              Learn more →
            </Link>
          </div>

          {/* API Documentation */}
          <div className="border border-gray-200 dark:border-dark-700 rounded-lg p-8 bg-white dark:bg-dark-800">
            <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">API Reference</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Integrate Syllogos into your workflow with our RESTful API.
            </p>
            <span className="text-gray-400 text-sm italic">Coming Q1 2025</span>
          </div>

          {/* Best Practices */}
          <div className="border border-gray-200 dark:border-dark-700 rounded-lg p-8 bg-white dark:bg-dark-800">
            <svg className="w-12 h-12 text-primary-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Best Practices</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Tips for getting the most accurate and useful analysis results.
            </p>
            <Link href="#" className="text-primary-600 hover:underline font-semibold">
              View tips →
            </Link>
          </div>
        </div>

        <div className="mt-16 p-8 bg-gray-50 dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Need Help?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Can&apos;t find what you&apos;re looking for? Check our FAQ or contact support.
          </p>
          <div className="flex gap-4">
            <Link
              href="/faq"
              className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              View FAQ
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 border-2 border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
