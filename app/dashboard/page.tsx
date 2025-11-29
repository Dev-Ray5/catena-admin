"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/app/lib/firebase"
import { Sidebar } from "@/app/components/sidebar"
import DashboardStats from "@/app/components/dashboard-stats"
import SystemUpdates from "@/app/components/system-updates"

interface UserData {
  username: string
  fullName: string
  email: string
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login")
        return
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData)
        }
      } catch (err) {
        console.error("Error fetching user data:", err)
      } finally {
        setIsLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  if (isLoading || !userData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar username={userData.username} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm">
          <h1 className="text-3xl font-bold text-primary">Hello {userData.username}</h1>
          <p className="text-gray-600 mt-1">{userData.fullName}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Stats Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Dashboard Overview</h2>
              <DashboardStats />
            </div>

            {/* System Updates Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Latest Updates</h2>
              <SystemUpdates />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
