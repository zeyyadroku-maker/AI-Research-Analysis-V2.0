'use client'

import { useState, useEffect } from 'react'

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        const duration = 2000
        const steps = 60
        const increment = target / steps
        const stepDuration = duration / steps

        let current = 0
        const timer = setInterval(() => {
            current += increment
            if (current >= target) {
                setCount(target)
                clearInterval(timer)
            } else {
                setCount(Math.floor(current))
            }
        }, stepDuration)

        return () => clearInterval(timer)
    }, [target])

    return <span>{count}{suffix}</span>
}

export default function Stats() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="glass-card p-8 rounded-2xl text-center group hover:-translate-y-1 transition-transform duration-300">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-400/70 to-primary-600/70 bg-clip-text text-transparent mb-2">
                    <AnimatedCounter target={8} />
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Bias Types</div>
                <div className="text-xs text-gray-500 font-mono uppercase tracking-wide mt-1">Systematically Detected</div>
            </div>

            <div className="glass-card p-8 rounded-2xl text-center group hover:-translate-y-1 transition-transform duration-300">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400/70 to-pink-400/70 bg-clip-text text-transparent mb-2">
                    <AnimatedCounter target={6} />
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Credibility Factors</div>
                <div className="text-xs text-gray-500 font-mono uppercase tracking-wide mt-1">Transparently Weighted</div>
            </div>

            <div className="glass-card p-8 rounded-2xl text-center group hover:-translate-y-1 transition-transform duration-300">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-400/70 to-primary-400/70 bg-clip-text text-transparent mb-2">
                    <AnimatedCounter target={20} suffix="+" />
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Researchers</div>
                <div className="text-xs text-gray-500 font-mono uppercase tracking-wide mt-1">Collaborative Design</div>
            </div>

            <div className="glass-card p-8 rounded-2xl text-center group hover:-translate-y-1 transition-transform duration-300">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400/70 to-red-400/70 bg-clip-text text-transparent mb-2">
                    <AnimatedCounter target={100} suffix="%" />
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Confidence Scores</div>
                <div className="text-xs text-gray-500 font-mono uppercase tracking-wide mt-1">Every Assessment</div>
            </div>
        </div>
    )
}
