'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        let animationFrameId: number

        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top

            // Use requestAnimationFrame for smoother performance
            cancelAnimationFrame(animationFrameId)
            animationFrameId = requestAnimationFrame(() => {
                container.style.setProperty('--mouse-x', `${x}px`)
                container.style.setProperty('--mouse-y', `${y}px`)
            })
        }

        container.addEventListener('mousemove', handleMouseMove)
        return () => {
            container.removeEventListener('mousemove', handleMouseMove)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <div
            ref={containerRef}
            className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32 bg-grid-pattern group"
        >
            {/* Background Elements - Mouse Following Gradient */}
            <div
                className="absolute inset-0 z-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100 pointer-events-none"
                style={{
                    background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(14, 165, 233, 0.15), transparent 40%)`
                }}
            />

            {/* Static Background Fallback / Base */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-white/50 to-white dark:via-dark-900/50 dark:to-dark-900" />
                {/* Simplified static glow for when mouse is not present/mobile */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                        </span>
                        <span className="text-sm font-medium text-primary-700 dark:text-primary-300 tracking-wide uppercase">v2.0 Now Available</span>
                    </div>

                    <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-8 text-gray-900 dark:text-white">
                        The AI That <br />
                        <span className="text-gradient-primary">Shows Its Work</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
                        Evaluate research credibility with transparent AI. Confidence scores for every claim, evidence for every assessment.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href="/search"
                            className="px-8 py-4 rounded-full bg-primary-600 hover:bg-primary-700 text-white font-semibold text-lg transition-all shadow-lg hover:shadow-primary-500/30 hover:-translate-y-1 flex items-center gap-2"
                        >
                            Start Analyzing
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        </Link>
                        <Link
                            href="#how-it-works"
                            className="px-8 py-4 rounded-full bg-white dark:bg-dark-800 text-gray-900 dark:text-white border border-gray-200 dark:border-dark-700 font-semibold text-lg transition-all hover:bg-gray-50 dark:hover:bg-dark-700 hover:border-gray-300 dark:hover:border-dark-600"
                        >
                            How It Works
                        </Link>
                    </div>
                </div>

                {/* Floating UI Elements (Decorative) */}
                <div className="mt-20 relative max-w-5xl mx-auto hidden md:block animate-slide-up animate-delay-300">
                    <div className="glass rounded-2xl p-2 shadow-2xl">
                        <div className="bg-white dark:bg-dark-900 rounded-xl overflow-hidden aspect-[16/9] relative flex items-center justify-center border border-gray-100 dark:border-dark-800">
                            <div className="text-center">
                                <div className="inline-block p-4 rounded-full bg-primary-50 dark:bg-primary-900/20 mb-4">
                                    <svg className="w-12 h-12 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-heading font-bold mb-2 text-gray-900 dark:text-white">Analysis Complete</h3>
                                <p className="text-gray-500">Credibility Score: <span className="text-primary-600 font-bold">94%</span></p>
                            </div>

                            {/* Floating Cards */}
                            <div className="absolute top-10 left-10 glass-card p-4 rounded-lg max-w-xs animate-float border border-gray-200 dark:border-dark-700">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-500">Methodology</span>
                                </div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-200">Sample size sufficient for statistical significance.</p>
                            </div>

                            <div className="absolute bottom-10 right-10 glass-card p-4 rounded-lg max-w-xs animate-float animate-delay-200 border border-gray-200 dark:border-dark-700">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-500">Citations</span>
                                </div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-200">All references verified against major databases.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
