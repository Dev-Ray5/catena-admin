"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/app/lib/firebase"
import { Sidebar } from "@/app/components/sidebar"
import { ManageProductsForm } from "@/app/components/manage-products-form"

interface UserData {
  username: string
  fullName: string
  email: string
}

export default function ManageProductsPage() {
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
      <Sidebar username={userData.username} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          <ManageProductsForm />
        </div>
      </div>
    </div>
  )
}