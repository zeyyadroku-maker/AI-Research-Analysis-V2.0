'use client'

import Navigation from './components/Navigation'
import Hero from './components/ui/Hero'
import Stats from './components/ui/Stats'
import FeatureCard from './components/ui/FeatureCard'
import Testimonials from './components/ui/Testimonials'
import Link from 'next/link'
import {
  ShieldCheck,
  FileText,
  Sliders,
  Search,
  AlertTriangle,
  Download
} from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-dark-900 transition-colors">
      <Navigation onLogoClick={() => window.location.href = '/'} />

      <Hero />

      {/* Stats Section */}
      <section className="py-20 bg-gray-50 dark:bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Stats />
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white to-gray-50 dark:from-dark-900 dark:to-dark-800 z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4 text-gray-900 dark:text-white">
              How It <span className="text-gradient-secondary">Works</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From PDF to comprehensive analysis in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white dark:bg-dark-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-dark-700 relative z-10 h-full">
                <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-2xl font-bold text-primary-600 dark:text-primary-400 mb-6">
                  1
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Upload or Search</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Upload a PDF or search by title, author, or DOI.
                </p>
                <span className="text-sm font-semibold text-primary-600">~30 seconds</span>
              </div>
              {/* Connector Line (Desktop) */}
              <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gray-200 dark:bg-dark-600 z-0" />
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white dark:bg-dark-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-dark-700 relative z-10 h-full">
                <div className="w-16 h-16 rounded-full bg-accent-purple/10 dark:bg-accent-purple/20 flex items-center justify-center text-2xl font-bold text-accent-purple dark:text-purple-400 mb-6">
                  2
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">AI Evaluates</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  AI assesses credibility, bias, and methodology—adapting to your paper&apos;s field automatically.
                </p>
                <span className="text-sm font-semibold text-accent-purple">~60 seconds</span>
              </div>
              {/* Connector Line (Desktop) */}
              <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gray-200 dark:bg-dark-600 z-0" />
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-white dark:bg-dark-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-dark-700 relative z-10 h-full">
                <div className="w-16 h-16 rounded-full bg-accent-teal/10 dark:bg-accent-teal/20 flex items-center justify-center text-2xl font-bold text-accent-teal dark:text-teal-400 mb-6">
                  3
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Review Results</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  View confidence scores, evidence-backed reasoning, and clear limitations for every assessment.
                </p>
                <span className="text-sm font-semibold text-accent-teal">~5 minutes to review</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-white dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4 text-gray-900 dark:text-white">
              Key <span className="text-gradient-primary">Features</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to evaluate research with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="Confidence Scores"
              description="See exactly how certain the AI is about each assessment. We show you what we know, what we think, and what we can't reliably assess."
              icon={<ShieldCheck className="w-8 h-8" />}
              colorClass="from-primary-500/80 to-primary-700/80"
            />
            <FeatureCard
              title="Shows Its Work"
              description="No black-box verdicts. Each credibility score, bias flag, and assessment includes specific evidence from the paper and clear reasoning."
              icon={<FileText className="w-8 h-8" />}
              colorClass="from-purple-500/80 to-pink-500/80"
            />
            <FeatureCard
              title="Adaptive Framework"
              description="Evaluation criteria automatically adjust to your academic discipline. A medical study needs different scrutiny than a humanities essay."
              icon={<Sliders className="w-8 h-8" />}
              colorClass="from-teal-500/80 to-primary-500/80"
            />
            <FeatureCard
              title="Citation Verification"
              description="We verify that cited works are real publications, not fabricated references. Catches AI-generated papers that cite non-existent sources."
              icon={<Search className="w-8 h-8" />}
              colorClass="from-blue-500/80 to-indigo-500/80"
            />
            <FeatureCard
              title="Bias Analysis"
              description="Identifies eight types of bias with evidence-backed severity ratings. Detects selection bias, confirmation bias, funding conflicts, and more."
              icon={<AlertTriangle className="w-8 h-8" />}
              colorClass="from-orange-500/80 to-red-500/80"
            />
            <FeatureCard
              title="Export Analysis"
              description="Download full analysis reports including all credibility scores, bias assessments, methodology evaluation, and evidence."
              icon={<Download className="w-8 h-8" />}
              colorClass="from-pink-500/80 to-rose-500/80"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50 dark:bg-dark-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-center mb-16 text-gray-900 dark:text-white">
            What Researchers <span className="text-gradient-secondary">Say</span>
          </h2>
          <Testimonials />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-900 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="font-heading font-bold text-2xl mb-6 bg-gradient-to-r from-[#0284c7] via-[#8b5cf6] via-[#ec4899] to-[#14b8a6] bg-clip-text text-transparent">Syllogos</div>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Transparency in every assessment. Built for researchers, by researchers.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/#features" className="hover:text-primary-600 transition-colors">Features</Link></li>
                <li><Link href="/#how-it-works" className="hover:text-primary-600 transition-colors">How It Works</Link></li>
                <li><Link href="/pricing" className="hover:text-primary-600 transition-colors">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/about" className="hover:text-primary-600 transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-primary-600 transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/privacy" className="hover:text-primary-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary-600 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-dark-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2025 Syllogos. All rights reserved.
            </p>
            <div className="flex gap-6">
              {/* Social icons would go here */}
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
