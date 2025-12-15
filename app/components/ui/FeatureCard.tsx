'use client'

interface FeatureCardProps {
    title: string
    description: string
    icon: React.ReactNode
    colorClass: string
}

export default function FeatureCard({ title, description, icon, colorClass }: FeatureCardProps) {
    return (
        <div className="group relative p-8 rounded-2xl bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClass} opacity-5 rounded-bl-full transition-opacity group-hover:opacity-10`} />

            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClass} bg-opacity-10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <div className="text-white">
                    {icon}
                </div>
            </div>

            <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-3">
                {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {description}
            </p>
        </div>
    )
}
