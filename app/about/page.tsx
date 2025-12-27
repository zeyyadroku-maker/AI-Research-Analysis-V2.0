'use client'

import Navigation from '../components/Navigation'
import Link from 'next/link'

export default function About() {
  return (
    <main className="min-h-screen bg-white dark:bg-dark-900 transition-colors">
      {/* Navigation */}
      <Navigation onLogoClick={() => window.location.href = '/'} />

      {/* About Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose Syllogos
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            The AI research tool that admits uncertainty and shows its work
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed text-lg text-center">
          <p>
            Most AI research tools promise perfect analysis but deliver overconfident verdicts with no explanation. They treat every paper the same way and hide their reasoning behind black-box algorithms. You&apos;re expected to trust the output without understanding how it arrived there.
          </p>

          <p>
            We built Syllogos differently. We admit when we&apos;re uncertain, show our confidence levels for every claim, and explain our reasoning with specific evidence. Our framework adapts to your paper&apos;s academic field. A medical study gets different scrutiny than a theoretical essay.
          </p>

          <p>
            We surveyed 20+ researchers before building this tool. They told us they needed transparency over confidence, and field-specific evaluation over generic scores. We built Syllogos because we understand that AI should support expert judgment, not replace it.
          </p>

          <p>
            Our commitment: We never invent citations, never hide uncertainty, and always show confidence percentages. If we can&apos;t reliably assess something, we say so. You deserve AI that shows its work, admits its limits, and respects your expertise.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            Try Syllogos
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  )
}
