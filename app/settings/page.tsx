'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { useTheme } from '@/app/providers/ThemeProvider'
import { User as UserIcon, Moon, Sun, LogOut, Shield, Mail } from 'lucide-react'

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
        router.push('/login')
    }

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                <div className="animate-pulse space-y-8">
                    <div className="h-8 w-48 bg-gray-200 dark:bg-dark-700 rounded-lg"></div>
                    <div className="h-64 bg-gray-200 dark:bg-dark-700 rounded-2xl"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>

            <div className="space-y-6">
                {/* Account Section */}
                <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-700 bg-gray-50/50 dark:bg-dark-700/50">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <UserIcon className="w-5 h-5 text-primary-500" />
                            Account Information
                        </h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Email Address
                                </label>
                                <div className="flex items-center gap-3 text-gray-900 dark:text-white font-medium p-3 bg-gray-50 dark:bg-dark-700 rounded-xl border border-gray-100 dark:border-dark-600">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    {user?.email}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Account Type
                                </label>
                                <div className="flex items-center gap-3 text-gray-900 dark:text-white font-medium p-3 bg-gray-50 dark:bg-dark-700 rounded-xl border border-gray-100 dark:border-dark-600">
                                    <Shield className="w-5 h-5 text-gray-400" />
                                    {user?.app_metadata?.provider === 'github' ? 'GitHub Account' :
                                        user?.app_metadata?.provider === 'google' ? 'Google Account' : 'Email Account'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preferences Section */}
                <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-700 bg-gray-50/50 dark:bg-dark-700/50">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Sun className="w-5 h-5 text-primary-500" />
                            Preferences
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-medium text-gray-900 dark:text-white">Appearance</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark mode</p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-dark-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors flex items-center gap-2 font-medium"
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
                    <div className="px-6 py-4 border-b border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/10">
                        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                            <LogOut className="w-5 h-5" />
                            Session
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-medium text-gray-900 dark:text-white">Sign Out</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">End your current session</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2 font-medium"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
