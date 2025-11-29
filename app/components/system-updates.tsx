"use client"

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/app/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"

interface Update {
  id: string
  title: string
  body: string
  timestamp?: string
}

interface ModalState {
  isOpen: boolean
  update: Update | null
}

export default function SystemUpdates() {
  const [updates, setUpdates] = useState<Update[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    update: null,
  })

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const updatesSnapshot = await getDocs(collection(db, "updates"))
        const updatesData = updatesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Update, "id">),
        }))
        setUpdates(updatesData)
      } catch (err) {
        console.error("Error fetching updates:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUpdates()
  }, [])

  const openModal = (update: Update) => {
    setModal({
      isOpen: true,
      update,
    })
  }

  const closeModal = () => {
    setModal({
      isOpen: false,
      update: null,
    })
  }

  return (
    <>
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-gray-800">System Updates</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : updates.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No updates available</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {updates.map((update) => (
                <button
                  key={update.id}
                  onClick={() => openModal(update)}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <h3 className="font-semibold text-gray-800 text-sm mb-1">{update.title}</h3>
                  <p className="text-gray-600 text-xs line-clamp-2">{update.body}</p>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {modal.isOpen && modal.update && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="bg-white max-w-md w-full shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-800">{modal.update.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 text-sm mb-6 whitespace-pre-wrap">{modal.update.body}</p>
              <Button onClick={closeModal} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
