'use client'

import Navigation from '../components/Navigation'

export default function Terms() {
  return (
    <main className="min-h-screen bg-white dark:bg-dark-900 transition-colors">
      <Navigation onLogoClick={() => window.location.href = '/'} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Terms of Service</h1>
        <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-gray-400">
          <p className="text-sm text-gray-500 dark:text-gray-500">Last updated: January 2025</p>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Acceptance of Terms</h2>
            <p>By accessing Syllogos, you agree to these Terms of Service. If you disagree with any part, you may not use our service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Service Description</h2>
            <p>Syllogos provides AI-powered research paper analysis. Our assessments are tools to assist research evaluation, not replacements for expert judgment.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">User Responsibilities</h2>
            <p>You agree to: use the service lawfully, not abuse or attempt to circumvent rate limits, maintain account security, and respect intellectual property rights.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Limitations of Liability</h2>
            <p>Syllogos is provided &quot;as is&quot; without warranties. We are not liable for decisions made based on our analysis. Always apply professional judgment.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Acceptable Use</h2>
            <p>Prohibited: automated scraping, reselling access, uploading malicious content, or violating third-party rights.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Termination</h2>
            <p>We may suspend or terminate accounts for violations of these terms. You may cancel your account at any time.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact</h2>
            <p>Questions? Email <a href="mailto:legal@syllogos.ai" className="text-primary-600 hover:underline">legal@syllogos.ai</a></p>
          </section>
        </div>
      </div>
    </main>
  )
}
