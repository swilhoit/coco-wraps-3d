'use client'

import dynamic from 'next/dynamic'
import ThemeToggle from '@/components/ThemeToggle'

// Lazy load the 3D component
const ChromeModel = dynamic(() => import('@/components/ChromeModel'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading 3D Experience...</p>
      </div>
    </div>
  )
})

export default function Home() {
  return (
    <div className="fixed inset-0 w-full h-full bg-background transition-colors duration-300">
      <ThemeToggle />
      <ChromeModel />
    </div>
  );
}