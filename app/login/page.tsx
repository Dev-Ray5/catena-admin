"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/app/lib/firebase"
import { AuthForm, type LoginData } from "@/app/components/auth-form"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (data: LoginData) => {
    setIsLoading(true)
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password)
      router.push("/dashboard")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in"
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return <AuthForm isSignup={false} onSubmit={handleLogin} isLoading={isLoading} />
}
