"use client"

import type React from "react"
import { useState } from "react"
import { z } from "zod"
import { Button } from "@/app/components/ui/button"
import { Card } from "@/app/components/ui/card"
import { FormItem, FormLabel, FormControl, FormMessage } from "@/app/components/ui/form"
import { Input } from "@/app/components/ui/input"
import { Textarea } from "@/app/components/ui/textarea"
import { ChevronDown, Plus, Trash2 } from "lucide-react"
import { collection, addDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/app/lib/firebase"

const variantSchema = z.object({
  name: z.string().min(1, "Variant name is required"),
  value: z.string().min(1, "Variant value is required"),
})

const productSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be positive"),
  imageLinks: z.array(z.string().url("Invalid URL")).default([]),
  quantity: z.coerce.number().nonnegative("Quantity cannot be negative").optional(),
  variants: z.array(variantSchema).default([]),
})

type ProductFormData = z.infer<typeof productSchema>

interface NewProductFormProps {
  onSuccess?: () => void
}

interface Variant {
  id: string
  name: string
  value: string
}

interface ImageLink {
  id: string
  url: string
}

export function NewProductForm({ onSuccess }: NewProductFormProps) {
  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    price: "",
  })

  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [imageLinks, setImageLinks] = useState<ImageLink[]>([])
  const [variants, setVariants] = useState<Variant[]>([])
  const [quantity, setQuantity] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showMoreSettings, setShowMoreSettings] = useState(false)
  const [validatingUrls, setValidatingUrls] = useState<{ [key: string]: boolean }>({})
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})

  // Validate form fields
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {}

    if (!formData.productName.trim()) {
      errors.productName = "Product name is required"
    }
    if (!formData.description.trim()) {
      errors.description = "Description is required"
    }
    if (!formData.price || Number.parseFloat(formData.price) <= 0) {
      errors.price = "Price must be a positive number"
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Verify image URL exists
  const verifyImageUrl = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: "HEAD" })
      return response.ok
    } catch {
      return false
    }
  }

  // Handle image file upload to Firebase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    try {
      setError("")
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          setError("Please upload only image files")
          return
        }

        const storageRef = ref(storage, `products/${Date.now()}_${file.name}`)
        await uploadBytes(storageRef, file)
        const downloadUrl = await getDownloadURL(storageRef)
        setUploadedImages((prev) => [...prev, downloadUrl])
      }
    } catch (err) {
      setError("Failed to upload image")
      console.error(err)
    }
  }

  // Handle adding image link with verification
  const handleAddImageLink = async (id: string, url: string) => {
    if (!url) return

    setValidatingUrls((prev) => ({ ...prev, [id]: true }))

    try {
      const isValid = await verifyImageUrl(url)
      if (!isValid) {
        setError(`Image at ${url} could not be verified or does not exist`)
        setImageLinks((prev) => prev.filter((link) => link.id !== id))
      }
    } catch (err) {
      setError("Failed to verify image URL")
      console.error(err)
    } finally {
      setValidatingUrls((prev) => ({ ...prev, [id]: false }))
    }
  }

  const handleAddImageLink_Button = () => {
    setImageLinks((prev) => [...prev, { id: Date.now().toString(), url: "" }])
  }

  const handleRemoveImageLink = (id: string) => {
    setImageLinks((prev) => prev.filter((link) => link.id !== id))
  }

  const handleUpdateImageLink = (id: string, url: string) => {
    setImageLinks((prev) => prev.map((link) => (link.id === id ? { ...link, url } : link)))
  }

  const handleAddVariant = () => {
    setVariants((prev) => [...prev, { id: Date.now().toString(), name: "", value: "" }])
  }

  const handleRemoveVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id))
  }

  const handleUpdateVariant = (id: string, field: "name" | "value", value: string) => {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, [field]: value } : v)))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setError("")

    try {
      // Combine uploaded images with provided links
      const allImages = [...uploadedImages, ...imageLinks.map((link) => link.url).filter(Boolean)]

      if (allImages.length === 0) {
        setError("Please add at least one product image")
        setIsLoading(false)
        return
      }

      // Create product document in Firestore
      const productData = {
        productName: formData.productName,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        images: allImages,
        quantity: quantity ? Number.parseInt(quantity) : 0,
        variants: variants.map(({ id, ...rest }) => rest),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await addDoc(collection(db, "products"), productData)

      // Reset form
      setFormData({ productName: "", description: "", price: "" })
      setUploadedImages([])
      setImageLinks([])
      setVariants([])
      setQuantity("")
      setShowMoreSettings(false)
      setFieldErrors({})
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create product"
      setError(errorMessage)
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <div className="p-8">
        <h1 className="text-3xl font-bold text-primary mb-6">Add New Product</h1>

        {error && <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Product Images Section */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Product Images</h2>

              {/* Upload Images */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">Drag and drop or click to select images</p>
              </div>

              {/* Display Uploaded Images */}
              {uploadedImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Images:</p>
                  <div className="flex flex-wrap gap-2">
                    {uploadedImages.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`Uploaded ${index}`}
                          className="h-20 w-20 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => setUploadedImages((prev) => prev.filter((_, i) => i !== index))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Links */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Or Add Image Links</label>
                  <button
                    type="button"
                    onClick={handleAddImageLink_Button}
                    className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                  >
                    <Plus size={16} /> Add Link
                  </button>
                </div>

                <div className="space-y-2">
                  {imageLinks.map((field) => (
                    <div key={field.id} className="flex gap-2">
                      <Input
                        value={field.url}
                        onChange={(e) => handleUpdateImageLink(field.id, e.target.value)}
                        onBlur={() => handleAddImageLink(field.id, field.url)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImageLink(field.id)}
                        className="mt-1 p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Product Details</h2>

            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="Enter product name"
                />
              </FormControl>
              {fieldErrors.productName && <FormMessage>{fieldErrors.productName}</FormMessage>}
            </FormItem>

            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter product description"
                  rows={4}
                />
              </FormControl>
              {fieldErrors.description && <FormMessage>{fieldErrors.description}</FormMessage>}
            </FormItem>

            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                />
              </FormControl>
              {fieldErrors.price && <FormMessage>{fieldErrors.price}</FormMessage>}
            </FormItem>
          </div>

          {/* More Settings */}
          <div className="border-t pt-6">
            <button
              type="button"
              onClick={() => setShowMoreSettings(!showMoreSettings)}
              className="flex items-center gap-2 text-primary font-medium hover:text-primary/80"
            >
              <ChevronDown size={20} className={`transition-transform ${showMoreSettings ? "rotate-180" : ""}`} />
              More Settings
            </button>

            {showMoreSettings && (
              <div className="mt-4 space-y-6 pl-6 border-l-2 border-primary">
                {/* Quantity in Stock */}
                <FormItem>
                  <FormLabel>Quantity in Stock</FormLabel>
                  <FormControl>
                    <Input
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      type="number"
                      placeholder="0"
                    />
                  </FormControl>
                </FormItem>

                {/* Product Variants */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-800">Product Variants</h3>
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                    >
                      <Plus size={16} /> Add Variant
                    </button>
                  </div>

                  {variants.length > 0 && (
                    <div className="space-y-3">
                      {variants.map((variant, index) => (
                        <div key={variant.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">Variant {index + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveVariant(variant.id)}
                              className="text-red-600 hover:bg-red-50 p-1 rounded"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>

                          <FormItem>
                            <FormLabel>Variant Name</FormLabel>
                            <FormControl>
                              <Input
                                value={variant.name}
                                onChange={(e) => handleUpdateVariant(variant.id, "name", e.target.value)}
                                placeholder="e.g., Color, Size"
                              />
                            </FormControl>
                          </FormItem>

                          <FormItem>
                            <FormLabel>Variant Value</FormLabel>
                            <FormControl>
                              <Input
                                value={variant.value}
                                onChange={(e) => handleUpdateVariant(variant.id, "value", e.target.value)}
                                placeholder="e.g., Red, Large"
                              />
                            </FormControl>
                          </FormItem>
                        </div>
                      ))}
                    </div>
                  )}

                  {variants.length === 0 && (
                    <p className="text-sm text-gray-500 italic">
                      No variants added yet. Click "Add Variant" to add one.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2"
            >
              {isLoading ? "Creating Product..." : "Create Product"}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  )
}