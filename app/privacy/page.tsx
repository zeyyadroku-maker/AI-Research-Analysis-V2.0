'use client'

import Navigation from '../components/Navigation'

export default function Privacy() {
  return (
    <main className="min-h-screen bg-white dark:bg-dark-900 transition-colors">
      <Navigation onLogoClick={() => window.location.href = '/'} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>
        <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-gray-400">
          <p className="text-sm text-gray-500 dark:text-gray-500">Last updated: January 2025</p>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Data Collection</h2>
            <p>We collect minimal data necessary to provide our service: account information (email, name), usage analytics, and paper analysis metadata. We do not permanently store uploaded paper content.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How We Use Your Data</h2>
            <p>Your data is used to: provide and improve our service, generate analysis reports, communicate service updates, and comply with legal obligations. We never sell your personal information.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Data Security</h2>
            <p>We employ industry-standard encryption, secure data storage, regular security audits, and access controls to protect your information.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Rights</h2>
            <p>You have the right to access, correct, delete, or export your data. Contact us at privacy@syllogos.ai to exercise these rights.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Cookies</h2>
            <p>We use essential cookies for authentication and preferences. No tracking cookies are used without your consent.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact</h2>
            <p>Questions about privacy? Email us at <a href="mailto:privacy@syllogos.ai" className="text-primary-600 hover:underline">privacy@syllogos.ai</a></p>
          </section>
        </div>
      </div>
    </main>
  )
}
