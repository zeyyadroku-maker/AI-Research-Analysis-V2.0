'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { useTheme } from '@/app/providers/ThemeProvider'
import { User as UserIcon, Moon, Sun, LogOut, Shield, Mail, ArrowLeft, Loader2 } from 'lucide-react'

export default function SettingsPage() {
    const router = useRouter()
    const { theme, toggleTheme } = useTheme()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
                return
            }
            setUser(session.user)
            setLoading(false)
        }
        checkUser()
    }, [router])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-6 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your account preferences and session.</p>
                </div>

                <div className="space-y-6">
                    {/* Account Section */}
                    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-700 bg-gray-50/50 dark:bg-dark-700/50 flex items-center gap-3">
                            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                                <UserIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Account Information
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                        Email Address
                                    </label>
                                    <div className="flex items-center gap-3 text-gray-900 dark:text-white font-medium p-3 bg-gray-50 dark:bg-dark-700/50 rounded-xl border border-gray-100 dark:border-dark-600">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        {user?.email}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                        Account Type
                                    </label>
                                    <div className="flex items-center gap-3 text-gray-900 dark:text-white font-medium p-3 bg-gray-50 dark:bg-dark-700/50 rounded-xl border border-gray-100 dark:border-dark-600">
                                        <Shield className="w-5 h-5 text-gray-400" />
                                        {user?.app_metadata?.provider === 'github' ? 'GitHub Account' :
                                            user?.app_metadata?.provider === 'google' ? 'Google Account' : 'Email Account'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preferences Section */}
                    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-700 bg-gray-50/50 dark:bg-dark-700/50 flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <Sun className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Appearance
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                                <div>
                                    <h3 className="text-base font-medium text-gray-900 dark:text-white">Theme Preference</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose how the application looks to you.</p>
                                </div>
                                <button
                                    onClick={toggleTheme}
                                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-dark-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-dark-600 transition-all active:scale-95 flex items-center justify-center gap-2 font-medium"
                                >
                                    {theme === 'light' ? (
                                        <>
                                            <Moon className="w-4 h-4" />
                                            Switch to Dark
                                        </>
                                    ) : (
                                        <>
                                            <Sun className="w-4 h-4" />
                                            Switch to Light
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30 overflow-hidden">
                        <div className="px-6 py-4 border-b border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/10 flex items-center gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
                                Session Management
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                                <div>
                                    <h3 className="text-base font-medium text-gray-900 dark:text-white">Sign Out</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Securely end your current session.</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all active:scale-95 flex items-center justify-center gap-2 font-medium border border-red-100 dark:border-red-900/30"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
