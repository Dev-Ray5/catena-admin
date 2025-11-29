"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/app/components/ui/button"
import { Card } from "@/app/components/ui/card"

interface AuthFormProps {
  isSignup?: boolean
  onSubmit: (data: SignupData | LoginData) => Promise<void>
  isLoading?: boolean
}

export interface SignupData {
  email: string
  password: string
  username: string
  fullName: string
}

export interface LoginData {
  email: string
  password: string
}

export function AuthForm({ isSignup = false, onSubmit, isLoading = false }: AuthFormProps) {
  const [formData, setFormData] = useState<SignupData | LoginData>(
    isSignup ? { email: "", password: "", username: "", fullName: "" } : { email: "", password: "" },
  )
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await onSubmit(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="p-8 space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <Image src="/logo.png" alt="Catena LTD Logo" width={80} height={80} className="object-contain" />
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-primary">Catena LTD</h1>
            <p className="text-sm text-gray-600">{isSignup ? "Create your account" : "Sign in to your account"}</p>
          </div>

          {/* Error Message */}
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">{error}</div>}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={(formData as SignupData).fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={(formData as SignupData).username}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="johndoe"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2"
            >
              {isLoading ? "Loading..." : isSignup ? "Create Account" : "Sign In"}
            </Button>
          </form>

          {/* Footer Link */}
          <div className="text-center text-sm text-gray-600">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <Link href="/signup" className="text-primary font-medium hover:underline">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
