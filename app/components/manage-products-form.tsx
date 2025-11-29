"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/app/components/ui/button"
import { Card } from "@/app/components/ui/card"
import { FormItem, FormLabel, FormControl, FormMessage } from "@/app/components/ui/form"
import { Input } from "@/app/components/ui/input"
import { Textarea } from "@/app/components/ui/textarea"
import { ChevronDown, Plus, Trash2, Edit2, X } from "lucide-react"
import { collection, query, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "@/app/lib/firebase"

interface Variant {
  id: string
  name: string
  value: string
}

interface ImageLink {
  id: string
  url: string
}

interface Product {
  id: string
  productName: string
  description: string
  price: number
  images: string[]
  quantity?: number
  variants: Array<{ name: string; value: string }>
  createdAt: any
  updatedAt: any
}

export function ManageProductsForm() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setError("")
        const q = query(collection(db, "products"))
        const querySnapshot = await getDocs(q)
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[]
        setProducts(productsData)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch products"
        setError(errorMessage)
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Verify image URL exists
  const verifyImageUrl = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: "HEAD" })
      return response.ok
    } catch {
      return false
    }
  }

  const filteredProducts = products.filter((product) =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-4">Manage Products</h1>

        {/* Search Bar */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80"
          />
        </div>

        {error && <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isEditing={editingProductId === product.id}
                onEdit={() => setEditingProductId(product.id)}
                onCancel={() => setEditingProductId(null)}
                onUpdate={(updatedProduct) => {
                  setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)))
                  setEditingProductId(null)
                }}
                onDelete={(productId) => {
                  setProducts((prev) => prev.filter((p) => p.id !== productId))
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface ProductCardProps {
  product: Product
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
  onUpdate: (product: Product) => void
  onDelete: (productId: string) => void
}

function ProductCard({ product, isEditing, onEdit, onCancel, onUpdate, onDelete }: ProductCardProps) {
  const [formData, setFormData] = useState({
    productName: product.productName,
    description: product.description,
    price: product.price.toString(),
    quantity: (product.quantity || 0).toString(),
  })

  const [uploadedImages, setUploadedImages] = useState<string[]>(product.images || [])
  const [imageLinks, setImageLinks] = useState<ImageLink[]>([])
  const [variants, setVariants] = useState<Variant[]>(
    product.variants?.map((v, i) => ({ id: i.toString(), ...v })) || [],
  )
  const [showMoreSettings, setShowMoreSettings] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})

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

  const handleRemoveImage = async (index: number) => {
    try {
      const imageUrl = uploadedImages[index]
      if (imageUrl.includes("firebasestorage")) {
        const imageRef = ref(storage, imageUrl)
        await deleteObject(imageRef)
      }
      setUploadedImages((prev) => prev.filter((_, i) => i !== index))
    } catch (err) {
      setError("Failed to delete image")
      console.error(err)
    }
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

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    setError("")

    try {
      if (uploadedImages.length === 0) {
        setError("Please add at least one product image")
        setIsSaving(false)
        return
      }

      const updatedProduct: Product = {
        ...product,
        productName: formData.productName,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        images: uploadedImages,
        quantity: Number.parseInt(formData.quantity) || 0,
        variants: variants.map(({ id, ...rest }) => rest),
        updatedAt: new Date(),
      }

      await updateDoc(doc(db, "products", product.id), {
        ...updatedProduct,
        updatedAt: new Date(),
      })

      onUpdate(updatedProduct)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update product"
      setError(errorMessage)
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      // Delete images from storage
      for (const imageUrl of uploadedImages) {
        if (imageUrl.includes("firebasestorage")) {
          try {
            const imageRef = ref(storage, imageUrl)
            await deleteObject(imageRef)
          } catch (err) {
            console.error("Failed to delete image:", err)
          }
        }
      }

      await deleteDoc(doc(db, "products", product.id))
      onDelete(product.id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete product"
      setError(errorMessage)
      console.error(err)
    }
  }

  if (!isEditing) {
    return (
      <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.images?.[0] || "/placeholder.svg"}
            alt={product.productName}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-800 truncate">{product.productName}</h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{product.description}</p>
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-bold text-primary">${product.price.toFixed(2)}</span>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Stock: {product.quantity || 0}</span>
          </div>
          <div className="flex gap-2">
            <Button onClick={onEdit} className="flex-1 bg-primary hover:bg-primary/90 text-white text-sm py-1">
              <Edit2 size={16} className="mr-1" /> Edit
            </Button>
            <Button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-1">
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3 shadow-lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary">Edit Product</h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        {error && <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Product Images</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer"
              />
            </div>

            {uploadedImages.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Images:</p>
                <div className="grid grid-cols-3 gap-2">
                  {uploadedImages.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url || "/placeholder.svg"}
                        alt={`Product ${index}`}
                        className="h-24 w-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Product Details</h3>

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
                  rows={3}
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
        </div>

        {/* More Settings */}
        <div className="border-t pt-6 mt-6">
          <button
            type="button"
            onClick={() => setShowMoreSettings(!showMoreSettings)}
            className="flex items-center gap-2 text-primary font-medium hover:text-primary/80"
          >
            <ChevronDown size={20} className={`transition-transform ${showMoreSettings ? "rotate-180" : ""}`} />
            More Settings
          </button>

          {showMoreSettings && (
            <div className="mt-4 space-y-4 pl-6 border-l-2 border-primary">
              <FormItem>
                <FormLabel>Quantity in Stock</FormLabel>
                <FormControl>
                  <Input
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    type="number"
                    placeholder="0"
                  />
                </FormControl>
              </FormItem>
            </div>
          )}
        </div>

        {/* Variants Section */}
        <div className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Product Variants</h3>
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
            <p className="text-sm text-gray-500 italic">No variants added. Click "Add Variant" to create one.</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8 pt-6 border-t">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-2"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <Button onClick={onCancel} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2">
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  )
}
