'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function EmailVerified() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-black px-4">
      <div className="bg-green-100 border border-green-300 rounded-2xl shadow-md p-6 text-center">
        <h1 className="text-2xl font-semibold mb-2">Email Verified ✅</h1>
        <p className="text-gray-700 mb-4">You're all set! Redirecting you to the home page...</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
        >
          Go to Dashboard Now
        </button>
      </div>
    </div>
  )
}
