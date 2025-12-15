import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from './providers/ThemeProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

export const metadata: Metadata = {
  title: 'Syllogos - The AI That Shows Its Work',
  description: 'Evaluate research credibility with transparent AI. Confidence scores for every claim, evidence for every assessment, built to complement expert judgment.',
  openGraph: {
    title: 'Syllogos - The AI That Shows Its Work',
    description: 'Evaluate research credibility with transparent AI. Confidence scores for every claim, evidence for every assessment.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Syllogos',
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Syllogos - The AI That Shows Its Work',
    description: 'Evaluate research credibility with transparent AI.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${outfit.variable}`}>
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem('theme-preference');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
        <ThemeProvider>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-md z-50">
            Skip to content
          </a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
