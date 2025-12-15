'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import { Github, Mail, ArrowRight, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)
    const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')

    const handleLoginSuccess = () => {
        if (process.env.NODE_ENV === 'production') {
            // Force hard redirect to custom domain
            window.location.href = 'https://syllogos.io'
        } else {
            router.push('/')
            router.refresh()
        }
    }

    useEffect(() => {
        // Check for error messages in URL
        const params = new URLSearchParams(window.location.search)
        const error = params.get('error')
        const errorMsg = params.get('message')
        if (error && errorMsg) {
            setMessage({ type: 'error', text: decodeURIComponent(errorMsg) })
        }

        const checkConnection = async () => {
            try {
                // Try to reach Supabase
                const { data: { session }, error } = await supabase.auth.getSession()
                if (error) throw error

                if (session) {
                    handleLoginSuccess()
                    return
                }

                setConnectionStatus('connected')
            } catch (e) {
                console.error('Connection check failed:', e)
                setConnectionStatus('error')
            }
        }
        checkConnection()
    }, [router])

    const getRedirectUrl = () => {
        if (process.env.NODE_ENV === 'production') {
            return 'https://syllogos.io/auth/callback'
        }
        return `${window.location.origin}/auth/callback`
    }

    const handleOAuthLogin = async (provider: 'github' | 'google') => {
        setIsLoading(true)
        setMessage(null)
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: getRedirectUrl(),
            },
        })

        if (error) {
            setMessage({ type: 'error', text: error.message })
            setIsLoading(false)
        }
    }

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage(null)

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: getRedirectUrl(),
                    },
                })
                if (error) {
                    setMessage({ type: 'error', text: error.message })
                } else {
                    setMessage({ type: 'success', text: 'Check your email for the confirmation link!' })
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) {
                    setMessage({ type: 'error', text: error.message })
                } else {
                    handleLoginSuccess()
                }
            }
        } catch (error: any) {
            console.error('Auth error:', error)
            setMessage({ type: 'error', text: error.message || 'An unexpected error occurred' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900 px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <Link href="/" className="mx-auto h-32 w-32 relative mb-6 block hover:opacity-90 transition-opacity">
                        <Image
                            src="/lightmode.png"
                            alt="Logo"
                            fill
                            className="object-contain dark:hidden"
                            priority
                        />
                        <Image
                            src="/darkmode.png"
                            alt="Logo"
                            fill
                            className="object-contain hidden dark:block"
                            priority
                        />
                    </Link>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                        {isSignUp ? 'Create an account' : 'Welcome back'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {isSignUp ? 'Start analyzing papers in seconds' : 'Sign in to access your bookmarks'}
                    </p>
                    <div className={`mt-2 text-xs ${connectionStatus === 'connected' ? 'text-green-500' :
                        connectionStatus === 'error' ? 'text-red-500' : 'text-gray-400'
                        }`}>
                        Status: {
                            connectionStatus === 'checking' ? 'Checking connection...' :
                                connectionStatus === 'connected' ? 'System Online (Connected)' :
                                    'Connection Failed - Check URL'
                        }
                    </div>
                </div>

                <div className="mt-8 space-y-6 bg-white dark:bg-dark-800 py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-100 dark:border-dark-700">

                    {/* OAuth Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={() => handleOAuthLogin('google')}
                            disabled={isLoading}
                            className="w-full flex justify-center items-center gap-3 px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-xl shadow-sm bg-white dark:bg-dark-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-600 transition-all duration-200"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Continue with Google
                        </button>

                        <button
                            onClick={() => handleOAuthLogin('github')}
                            disabled={isLoading}
                            className="w-full flex justify-center items-center gap-3 px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-xl shadow-sm bg-white dark:bg-dark-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-600 transition-all duration-200"
                        >
                            <Github className="h-5 w-5" />
                            Continue with GitHub
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-dark-600" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-dark-800 text-gray-500">Or continue with email</span>
                        </div>
                    </div>

                    {/* Email Form */}
                    <form className="space-y-4" onSubmit={handleEmailAuth}>
                        {message && (
                            <div className={`p-3 rounded-lg text-sm ${message.type === 'error'
                                ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                : 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email address
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-dark-600 rounded-xl leading-5 bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete={isSignUp ? "new-password" : "current-password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full px-3 py-3 border border-gray-300 dark:border-dark-600 rounded-xl leading-5 bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    {isSignUp ? 'Create Account' : 'Sign In'}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="relative flex justify-center text-sm">
                                <button
                                    onClick={() => {
                                        setIsSignUp(!isSignUp)
                                        setMessage(null)
                                    }}
                                    className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                                >
                                    {isSignUp
                                        ? 'Already have an account? Sign in'
                                        : "Don't have an account? Sign up"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
