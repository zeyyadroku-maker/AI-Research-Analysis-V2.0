'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { User } from '@supabase/supabase-js'
import { LogIn, LogOut, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AuthButton() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

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
    }

    if (loading) {
        return <div className="h-10 w-24 bg-gray-200 dark:bg-dark-700 rounded-xl animate-pulse"></div>
    }

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline-block">
                    {user.email}
                </span>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-xl transition-all duration-100 active:scale-95 flex items-center gap-2 bg-gray-100 dark:bg-dark-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-dark-600"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
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
