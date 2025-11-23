'use client'

import { useState } from 'react'
import Navigation from '../components/Navigation'

const faqs = [
  {
    question: "How does Syllogos analyze research papers?",
    answer: "Syllogos uses advanced AI to evaluate papers across multiple dimensions including methodological rigor, data transparency, source quality, and bias detection. Our adaptive framework adjusts evaluation criteria based on the paper's field and document type."
  },
  {
    question: "What makes your analysis transparent?",
    answer: "Every assessment includes confidence scores (0-100%) showing our certainty level. We provide specific evidence citations and explain our reasoning. If we're uncertain about something, we explicitly say so rather than making overconfident claims."
  },
  {
    question: "Can I analyze papers from any academic field?",
    answer: "Yes! Our system recognizes 8 major academic fields (natural sciences, engineering, medical, social sciences, humanities, etc.) and adapts the evaluation framework accordingly. A medical RCT is assessed differently than a qualitative ethnography."
  },
  {
    question: "How accurate is the bias detection?",
    answer: "We detect 8 types of bias with varying confidence levels. Our system flags potential issues but encourages expert judgment. We're transparent about limitations and provide evidence for each bias claim."
  },
  {
    question: "Do you store my analyzed papers?",
    answer: "We only store metadata necessary for your account (titles, analysis results). The actual paper content is processed but not permanently stored. See our Privacy Policy for details."
  },
  {
    question: "Can I export analysis results?",
    answer: "Yes (Pro plan and above). Export comprehensive reports as PDF including all credibility scores, bias assessments, and evidence. Perfect for sharing with colleagues or grant reviewers."
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <main className="min-h-screen bg-white dark:bg-dark-900 transition-colors">
      <Navigation onLogoClick={() => window.location.href = '/'} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Everything you need to know about Syllogos
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
              >
                <span className="text-lg font-semibold text-gray-900 dark:text-white pr-8">
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform ${openIndex === index ? 'transform rotate-180' : ''
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 bg-gray-50 dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Still have questions?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Can&apos;t find the answer you&apos;re looking for? Contact our support team.
          </p>
          <a
            href="/contact"
            className="inline-block px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </main>
  )
}
