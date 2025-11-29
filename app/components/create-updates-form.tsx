"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import { Card } from "@/app/components/ui/card"
import { FormItem, FormLabel, FormControl, FormMessage } from "@/app/components/ui/form"
import { Input } from "@/app/components/ui/input"
import { Textarea } from "@/app/components/ui/textarea"
import { collection, addDoc } from "firebase/firestore"
import { db } from "@/app/lib/firebase"

interface CreateUpdateFormProps {
  onSuccess?: () => void
}

export function CreateUpdateForm({ onSuccess }: CreateUpdateFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    body: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {}

    if (!formData.title.trim()) {
      errors.title = "Update title is required"
    }
    if (!formData.body.trim()) {
      errors.body = "Update body is required"
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setError("")

    try {
      const updateData = {
        title: formData.title,
        body: formData.body,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await addDoc(collection(db, "updates"), updateData)

      // Reset form
      setFormData({ title: "", body: "" })
      setFieldErrors({})
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create update"
      setError(errorMessage)
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <div className="p-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Create System Update</h1>
        <p className="text-gray-600 mb-6">Create and publish a new system update for your store</p>

        {error && <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

        <form onSubmit={onSubmit} className="space-y-6">
          <FormItem>
            <FormLabel>Update Title</FormLabel>
            <FormControl>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter update title"
              />
            </FormControl>
            {fieldErrors.title && <FormMessage>{fieldErrors.title}</FormMessage>}
          </FormItem>

          <FormItem>
            <FormLabel>Update Body</FormLabel>
            <FormControl>
              <Textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Enter detailed update information"
                rows={8}
              />
            </FormControl>
            {fieldErrors.body && <FormMessage>{fieldErrors.body}</FormMessage>}
          </FormItem>

          <div className="pt-6 border-t">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2"
            >
              {isLoading ? "Publishing Update..." : "Publish Update"}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  )
}
