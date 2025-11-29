"use client"

import { CreateUpdateForm } from "@/app/components/create-updates-form"
import { useRouter } from "next/navigation"

export default function UpdatesPage() {
  const router = useRouter()

  const handleSuccess = () => {
    // Show success message and refresh
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <CreateUpdateForm onSuccess={handleSuccess} />
      </div>
    </main>
  )
}
