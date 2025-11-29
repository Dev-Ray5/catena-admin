"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/app/lib/firebase"
import { AuthForm, type SignupData } from "@/app/components/auth-form"

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (data: SignupData) => {
    setIsLoading(true)
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)

      const uid = userCredential.user.uid

      // Store user data in Firestore
      await setDoc(doc(db, "users", uid), {
        uid,
        email: data.email,
        username: data.username,
        fullName: data.fullName,
        createdAt: new Date(),
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create account"
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthForm 
      isSignup={true} 
      onSubmit={handleSignup as (data: SignupData | import("@/app/components/auth-form").LoginData) => Promise<void>} 
      isLoading={isLoading} 
    />
  )
}