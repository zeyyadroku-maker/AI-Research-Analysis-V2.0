'use client'

import Navigation from '../components/Navigation'
import Link from 'next/link'

const blogPosts = [
  {
    title: "Introducing Syllogos: Transparent AI for Research",
    excerpt: "Why we built an AI tool that admits uncertainty and shows its work.",
    date: "Jan 15, 2025",
    category: "Product"
  },
  {
    title: "How Our Adaptive Framework Works",
    excerpt: "Deep dive into field-specific evaluation criteria and why one-size-fits-all doesn't work for research.",
    date: "Jan 10, 2025",
    category: "Technical"
  },
  {
    title: "The 8 Types of Bias We Detect",
    excerpt: "From selection bias to confirmation bias - understanding systematic errors in research.",
    date: "Jan 5, 2025",
    category: "Research"
  }
]

export default function Blog() {
  return (
    <main className="min-h-screen bg-white dark:bg-dark-900 transition-colors">
      <Navigation onLogoClick={() => window.location.href = '/'} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Blog
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Insights on research credibility, AI transparency, and academic publishing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <article
              key={index}
              className="border border-gray-200 dark:border-dark-700 rounded-lg p-6 bg-white dark:bg-dark-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="mb-4">
                <span className="text-sm font-semibold text-primary-600">{post.category}</span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{post.date}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {post.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {post.excerpt}
              </p>
              <Link
                href="#"
                className="text-primary-600 hover:underline font-semibold inline-flex items-center gap-2"
              >
                Read more
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            More articles coming soon. Subscribe to our newsletter for updates.
          </p>
        </div>
      </div>
    </main>
  )
}
