'use client'

export default function Testimonials() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-2xl relative hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute -top-4 left-8 w-8 h-8 bg-primary-400/80 rounded-full flex items-center justify-center text-white text-xl font-serif">
                    &quot;
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed italic">
                    The confidence percentages changed everything. I can finally see where the AI is guessing versus where it&apos;s certain about the evidence.
                </p>
                <div>
                    <div className="font-bold text-gray-900 dark:text-white">Postdoctoral Researcher</div>
                    <div className="text-sm text-primary-400 font-mono">Neuroscience</div>
                </div>
            </div>

            <div className="glass-card p-8 rounded-2xl relative hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute -top-4 left-8 w-8 h-8 bg-purple-400/80 rounded-full flex items-center justify-center text-white text-xl font-serif">
                    &quot;
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed italic">
                    It actually understands qualitative research. Most tools try to score everything like a lab experiment, but this one gets ethnographic methods.
                </p>
                <div>
                    <div className="font-bold text-gray-900 dark:text-white">Associate Professor</div>
                    <div className="text-sm text-purple-400 font-mono">Anthropology</div>
                </div>
            </div>

            <div className="glass-card p-8 rounded-2xl relative hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute -top-4 left-8 w-8 h-8 bg-teal-400/80 rounded-full flex items-center justify-center text-white text-xl font-serif">
                    &quot;
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed italic">
                    I used to spend hours screening papers before diving deep. Now I can filter out weak methodology in minutes and focus on promising studies.
                </p>
                <div>
                    <div className="font-bold text-gray-900 dark:text-white">Research Associate</div>
                    <div className="text-sm text-teal-400 font-mono">Environmental Science</div>
                </div>
            </div>
        </div>
    )
}
