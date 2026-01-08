'use client'

import { useState, useRef, useEffect } from 'react'
import { AnalysisResult } from '@/app/types'
import { Send, User, Bot, ExternalLink, X, Sparkles, MessageSquare, Network, AlertTriangle } from 'lucide-react'

interface ExperimentalFeaturesViewProps {
    analysis: AnalysisResult
    onClose: () => void
}

type Tab = 'chat' | 'network'

export default function ExperimentalFeaturesView({ analysis, onClose }: ExperimentalFeaturesViewProps) {
    const [activeTab, setActiveTab] = useState<Tab>('chat')

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-5xl h-[85vh] bg-white dark:bg-dark-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-indigo-500/30 ring-4 ring-indigo-500/10">

                {/* Header */}
                <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 dark:border-dark-800 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-dark-800 dark:to-dark-900">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                Experimental Features
                                <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">Beta</span>
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Testing new ways to interact with research</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-dark-800 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-800/50">
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`flex-1 py-3 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative ${activeTab === 'chat'
                            ? 'text-indigo-600 dark:text-indigo-400 bg-white dark:bg-dark-900'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-800'
                            }`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        Chat with Paper
                        {activeTab === 'chat' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('network')}
                        className={`flex-1 py-3 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative ${activeTab === 'network'
                            ? 'text-purple-600 dark:text-purple-400 bg-white dark:bg-dark-900'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-800'
                            }`}
                    >
                        <Network className="w-4 h-4" />
                        Citation Network
                        {activeTab === 'network' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600 dark:bg-purple-400" />
                        )}
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden bg-gray-50/50 dark:bg-dark-900 relative">
                    {activeTab === 'chat' ? (
                        <ChatInterface analysis={analysis} />
                    ) : (
                        <NetworkInterface analysis={analysis} />
                    )}
                </div>
            </div>
        </div>
    )
}

// --- Chat Feature ---

function ChatInterface({ analysis }: { analysis: AnalysisResult }) {
    const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
        { role: 'ai', content: `Hello! I've analyzed "${analysis.paper.title}". Ask me anything about its methodology, findings, or biases.` }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMsg = input
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setInput('')
        setIsTyping(true)

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg, analysis }),
            })

            if (!response.ok) throw new Error('Failed to get response')

            const data = await response.json()
            setMessages(prev => [...prev, { role: 'ai', content: data.reply }])
        } catch (error) {
            console.error('Chat error:', error)
            setMessages(prev => [...prev, { role: 'ai', content: "I'm sorry, I encountered an error connecting to the AI. Please try again." }])
        } finally {
            setIsTyping(false)
        }
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user'
                            ? 'bg-gray-200 dark:bg-dark-700 text-gray-600 dark:text-gray-300'
                            : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                            }`}>
                            {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                        </div>
                        <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                            ? 'bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 rounded-tr-none border border-gray-100 dark:border-dark-700'
                            : 'bg-indigo-600 text-white rounded-tl-none'
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400">
                            <Bot className="w-5 h-5" />
                        </div>
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white dark:bg-dark-900 border-t border-gray-200 dark:border-dark-800">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask a question about this paper..."
                        className="w-full pl-4 pr-12 py-3 rounded-xl bg-gray-100 dark:bg-dark-800 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-dark-800 focus:ring-0 transition-all text-gray-900 dark:text-white placeholder-gray-500"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}


// --- Network Feature ---

function NetworkInterface({ analysis }: { analysis: AnalysisResult }) {
    // Interactive State
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
    const [isDragging, setIsDragging] = useState(false)
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
    const containerRef = useRef<HTMLDivElement>(null)

    // Data State
    const [graphData, setGraphData] = useState<{ nodes: any[], links: any[] } | null>(null)
    const [isMockData, setIsMockData] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchGraphData = async () => {
            setLoading(true)
            setError(null)
            setIsMockData(false)
            try {
                const response = await fetch('/api/citations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: analysis.paper.title,
                        doi: analysis.paper.doi
                    })
                })

                if (!response.ok) {
                    throw new Error('Failed to load citation network')
                }

                const data = await response.json()
                setGraphData(data)
                if (data.isMock) {
                    setIsMockData(true)
                }
            } catch (err) {
                console.error('Network graph error:', err)
                setError('Could not load citation network. Please try again later.')
            } finally {
                setLoading(false)
            }
        }

        fetchGraphData()
    }, [analysis.paper.title, analysis.paper.doi])

    // Event Handlers
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault()
        const scaleAdjustment = e.deltaY * -0.001
        const newScale = Math.min(Math.max(transform.scale + scaleAdjustment, 0.5), 3)
        setTransform(prev => ({ ...prev, scale: newScale }))
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true)
        setLastMousePos({ x: e.clientX, y: e.clientY })
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return
        const dx = e.clientX - lastMousePos.x
        const dy = e.clientY - lastMousePos.y
        setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }))
        setLastMousePos({ x: e.clientX, y: e.clientY })
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    const handleNodeClick = (url: string) => {
        if (url && url !== '#') {
            window.open(url, '_blank')
        }
    }

    const resetView = () => setTransform({ x: 0, y: 0, scale: 1 })

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-dark-900">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading citation network...</p>
                </div>
            </div>
        )
    }

    if (error || !graphData) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-dark-900">
                <div className="text-center p-6 max-w-md">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
                        <Network className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Network Unavailable</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{error || 'No data available for this paper.'}</p>
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col relative">
            {/* Controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
                {isMockData && (
                    <div className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 text-xs font-medium flex items-center gap-2 shadow-sm backdrop-blur">
                        <AlertTriangle size={12} />
                        Using Offline Data
                    </div>
                )}
                <div className="bg-white/90 dark:bg-dark-800/90 backdrop-blur p-3 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 text-xs">
                    <div className="font-bold mb-2 text-gray-900 dark:text-white">Legend</div>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-600"></div><span className="text-gray-600 dark:text-gray-300">Current Paper</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-gray-600 dark:text-gray-300">References</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-gray-600 dark:text-gray-300">Citations</span></div>
                    </div>
                </div>
                <div className="bg-white/90 dark:bg-dark-800/90 backdrop-blur p-2 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 flex flex-col gap-1">
                    <button onClick={() => setTransform(prev => ({ ...prev, scale: Math.min(prev.scale + 0.2, 3) }))} className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded text-gray-600 dark:text-gray-300 font-bold">+</button>
                    <button onClick={() => setTransform(prev => ({ ...prev, scale: Math.max(prev.scale - 0.2, 0.5) }))} className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded text-gray-600 dark:text-gray-300 font-bold">-</button>
                    <button onClick={resetView} className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded text-xs text-gray-600 dark:text-gray-300">Reset</button>
                </div>
            </div>

            <div
                ref={containerRef}
                className="flex-1 bg-slate-50 dark:bg-dark-900 relative overflow-hidden cursor-move"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div
                    style={{
                        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                        transformOrigin: 'center',
                        transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <svg className="w-[800px] h-[600px] overflow-visible" viewBox="0 0 800 600">
                        {/* Links */}
                        {graphData.links.map((link: any, i: number) => {
                            const source = graphData.nodes.find((n: any) => n.id === link.source)
                            const target = graphData.nodes.find((n: any) => n.id === link.target)
                            if (!source || !target) return null

                            return (
                                <line
                                    key={i}
                                    x1={source.x}
                                    y1={source.y}
                                    x2={target.x}
                                    y2={target.y}
                                    stroke="#CBD5E1"
                                    strokeWidth="2"
                                    className="dark:stroke-dark-600"
                                />
                            )
                        })}

                        {/* Nodes */}
                        {graphData.nodes.map((node: any) => (
                            <g
                                key={node.id}
                                transform={`translate(${node.x}, ${node.y})`}
                                className={`cursor-pointer hover:opacity-80 transition-all group ${node.id === 'main' ? '' : ''}`}
                                onClick={(e) => { e.stopPropagation(); handleNodeClick(node.url); }}
                            >
                                <circle
                                    r={node.r}
                                    fill={node.color}
                                    className={`${node.id === 'main' ? 'animate-pulse-slow shadow-lg drop-shadow-xl' : 'drop-shadow-md group-hover:drop-shadow-xl transition-all'}`}
                                />
                                {node.id === 'main' && (
                                    <circle r={node.r} fill="url(#centerGradient)" opacity="0.5" />
                                )}

                                {/* Hover Effect Ring */}
                                <circle r={node.r + 5} fill="white" opacity="0" className="group-hover:opacity-20 transition-opacity" />

                                {/* Label */}
                                <text
                                    y={node.r + 15}
                                    textAnchor="middle"
                                    className={`fill-gray-600 dark:fill-gray-300 text-xs font-medium select-none bg-white/50 px-1 rounded ${node.id === 'main' ? 'font-bold' : ''}`}
                                >
                                    {node.label}
                                </text>

                                {/* External Link Icon on Hover */}
                                {node.url !== '#' && (
                                    <g transform={`translate(${node.r - 10}, -${node.r})`} opacity="0" className="group-hover:opacity-100 transition-opacity">
                                        <circle r="10" fill="white" className="dark:fill-dark-800 drop-shadow" />
                                        <ExternalLink size={10} className="text-gray-600 dark:text-gray-300" x="-5" y="-5" />
                                    </g>
                                )}
                            </g>
                        ))}

                        <defs>
                            <radialGradient id="centerGradient">
                                <stop offset="0%" stopColor="white" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="white" stopOpacity="0" />
                            </radialGradient>
                        </defs>
                    </svg>
                </div>
            </div>

            <div className="p-4 bg-white dark:bg-dark-900 border-t border-gray-200 dark:border-dark-800 text-center z-10">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">Interactive Graph:</span>
                    Scroll to zoom ΓÇó Drag to pan ΓÇó Click nodes to view source
                </p>
            </div>
        </div>
    )
}
