'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { User } from '@supabase/supabase-js'
import { LogIn, LogOut, UserPlus, User as UserIcon, Settings, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AuthButton() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        // Check active session
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user ?? null)
            setLoading(false)
        }

        checkUser()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleLogin = () => {
        router.push('/login')
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    if (loading) {
        return <div className="h-10 w-24 bg-gray-200 dark:bg-dark-700 rounded-xl animate-pulse"></div>
    }

    if (user) {
        return (
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-dark-600"
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-sm">
                        <UserIcon className="w-4 h-4" />
                    </div>
                    <div className="hidden sm:flex flex-col items-start">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-200">Profile</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-gray-100 dark:border-dark-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                            <div className="px-4 py-2 border-b border-gray-100 dark:border-dark-700 mb-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={user.email}>{user.email}</p>
                            </div>

                            <div className="px-1">
                                <button
                                    onClick={() => {
                                        setIsOpen(false)
                                        router.push('/settings')
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <Settings className="w-4 h-4 text-gray-400" />
                                    Settings
                                </button>

                                <button
                                    onClick={() => {
                                        setIsOpen(false)
                                        handleLogout()
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2 transition-colors mt-1"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleLogin}
                className="px-4 py-2 rounded-xl transition-all duration-100 active:scale-95 flex items-center gap-2 bg-gray-100 dark:bg-dark-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-dark-600"
            >
                <LogIn className="w-5 h-5" />
                Log In
            </button>
            <button
                onClick={handleLogin}
                className="px-4 py-2 rounded-xl transition-all duration-100 active:scale-95 flex items-center gap-2 bg-primary-600 text-white hover:bg-primary-700"
            >
                <UserPlus className="w-5 h-5" />
                Sign Up
            </button>
        </div>
    )
}
