"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/app/lib/firebase"
import { Sidebar } from "@/app/components/sidebar"
import { Card } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"
import {
  Loader2,
  Search,
  AlertCircle,
  Package,
  User,
  MapPin,
  Mail,
  Phone,
  Building2,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  ShoppingBag,
  CheckCheck,
} from "lucide-react"

interface UserData {
  username: string
  fullName: string
  email: string
}

interface OrderItem {
  productId: string
  productName: string
  price: number
  quantity: number
  selectedVariant?: {
    name: string
    value: string
  }
  finalPrice: number
}

interface Order {
  id: string
  items: OrderItem[]
  totalAmount: number
  notes: string
  customerDetails: {
    fullName: string
    companyName: string
    phone: string
    email: string
    address: string
  }
  status: string
  createdAt: any
}

export default function VerifyOrdersPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [searchOrderId, setSearchOrderId] = useState("")
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [notFound, setNotFound] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [approvalError, setApprovalError] = useState("")

  const formatNaira = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
};


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
        setIsLoadingUser(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleSearch = async () => {
    if (!searchOrderId.trim()) {
      setError("Please enter an Order ID")
      return
    }

    setIsLoading(true)
    setError("")
    setNotFound(false)
    setOrder(null)

    try {
      const orderRef = doc(db, "orders", searchOrderId)
      const orderSnap = await getDoc(orderRef)

      if (orderSnap.exists()) {
        setOrder({
          id: orderSnap.id,
          ...orderSnap.data(),
        } as Order)
      } else {
        setNotFound(true)
        setError("Order not found. Please check the Order ID.")
      }
    } catch (err) {
      console.error("Error fetching order:", err)
      setError("Failed to fetch order. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          border: "border-yellow-300",
          icon: Clock,
        }
      case "completed":
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          border: "border-green-300",
          icon: CheckCircle2,
        }
      case "cancelled":
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          border: "border-red-300",
          icon: XCircle,
        }
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          border: "border-gray-300",
          icon: Package,
        }
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleApproveOrder = async () => {
    if (!order || order.status.toLowerCase() !== "pending") {
      setApprovalError("Only pending orders can be approved")
      return
    }

    setIsApproving(true)
    setApprovalError("")

    try {
      // Update order status to approved
      const orderRef = doc(db, "orders", order.id)
      await updateDoc(orderRef, {
        status: "approved",
        approvedAt: new Date(),
      })

      // Deduct quantity from product stock
      for (const item of order.items) {
        const productRef = doc(db, "products", item.productId)
        const productSnap = await getDoc(productRef)

        if (productSnap.exists()) {
          const currentQuantity = productSnap.data().quantity || 0
          const newQuantity = Math.max(0, currentQuantity - item.quantity)

          await updateDoc(productRef, {
            quantity: newQuantity,
          })
        }
      }

      // Update local state to reflect changes
      setOrder((prevOrder) =>
        prevOrder
          ? {
              ...prevOrder,
              status: "approved",
            }
          : null,
      )
    } catch (err) {
      console.error("Error approving order:", err)
      setApprovalError("Failed to approve order. Please try again.")
    } finally {
      setIsApproving(false)
    }
  }

  if (isLoadingUser || !userData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const statusConfig = order ? getStatusConfig(order.status) : null
  const StatusIcon = statusConfig?.icon

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar username={userData.username} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <main className="min-h-full bg-gradient-to-br from-blue-50 via-white to-blue-50">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                  <Search className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold">Order Verification</h1>
                  <p className="text-blue-100 text-sm md:text-base">Search and verify customer orders</p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-8 pb-12">
            {/* Search Section */}
            <Card className="p-6 md:p-8 mb-8 border-0 shadow-xl bg-white">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Enter Order ID (e.g., ABC123XYZ)..."
                    value={searchOrderId}
                    onChange={(e) => setSearchOrderId(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-blue-500"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-14 px-8 shadow-lg hover:shadow-xl transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Search Order
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Error Message */}
            {error && (
              <Card className="p-6 mb-8 bg-red-50 border-2 border-red-200 shadow-lg">
                <div className="flex gap-3">
                  <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800 mb-1">Order Not Found</p>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Order Details */}
            {order && statusConfig && (
              <div className="space-y-6">
                {/* Order Header */}
                <Card className="border-0 shadow-xl overflow-hidden">
                  <div className={`${statusConfig.bg} ${statusConfig.text} border-b-4 ${statusConfig.border} p-6`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 mb-2">
                        {StatusIcon && <StatusIcon className="h-8 w-8" />}
                        <div>
                          <p className="text-sm font-medium opacity-80">Order Status</p>
                          <p className="text-2xl font-bold">
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </p>
                        </div>
                      </div>
                      {order.status.toLowerCase() === "pending" && (
                        <Button
                          onClick={handleApproveOrder}
                          disabled={isApproving}
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 h-12 shadow-lg"
                        >
                          {isApproving ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Approving...
                            </>
                          ) : (
                            <>
                              <CheckCheck className="h-5 w-5 mr-2" />
                              Approve Order
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="h-5 w-5 text-blue-600" />
                        <p className="text-sm font-medium text-gray-600">Order ID</p>
                      </div>
                      <p className="text-lg font-mono font-bold text-gray-900">{order.id}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <p className="text-sm font-medium text-gray-600">Order Date</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{formatDate(order.createdAt)}</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-lg text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-5 w-5" />
                        <p className="text-sm font-medium opacity-90">Total Amount</p>
                      </div>
                      <p className="text-2xl font-bold">{formatNaira(order.totalAmount)}</p>
                    </div>
                  </div>
                </Card>

                {/* Approval Error Message */}
                {approvalError && (
                  <Card className="p-6 bg-red-50 border-2 border-red-200 shadow-lg">
                    <div className="flex gap-3">
                      <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-800 mb-1">Approval Error</p>
                        <p className="text-red-700">{approvalError}</p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Customer Details */}
                <Card className="border-0 shadow-lg">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                    <div className="flex items-center gap-2 text-white">
                      <User className="h-5 w-5" />
                      <h2 className="text-lg font-bold">Customer Information</h2>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">Full Name</p>
                        <p className="text-gray-900 font-semibold">{order.customerDetails.fullName}</p>
                      </div>
                    </div>

                    {order.customerDetails.companyName && (
                      <div className="flex items-start gap-3">
                        <Building2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-medium">Company Name</p>
                          <p className="text-gray-900 font-semibold">{order.customerDetails.companyName}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">Phone Number</p>
                        <p className="text-gray-900 font-semibold">{order.customerDetails.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">Email Address</p>
                        <p className="text-gray-900 font-semibold break-all">{order.customerDetails.email}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">Delivery Address</p>
                        <p className="text-gray-900 font-semibold">{order.customerDetails.address}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Order Items */}
                <Card className="border-0 shadow-lg">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                    <div className="flex items-center gap-2 text-white">
                      <ShoppingBag className="h-5 w-5" />
                      <h2 className="text-lg font-bold">Order Items ({order.items.length})</h2>
                    </div>
                  </div>
                  <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                    {order.items.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex gap-4">
                          <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                            <Package className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 mb-1 truncate">{item.productName}</p>
                            {item.selectedVariant && (
                              <p className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">{item.selectedVariant.name}:</span>{" "}
                                {item.selectedVariant.value}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex gap-4 text-gray-600">
                                <span>
                                  {formatNaira(item.price)} × {item.quantity}
                                </span>
                              </div>
                              <p className="font-bold text-blue-600 text-lg">{formatNaira(item.finalPrice)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-blue-50 border-t-2 border-blue-200 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">Subtotal</span>
                      <span className="text-2xl font-bold text-blue-600">{formatNaira(order.totalAmount)}</span>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Empty State */}
            {!order && !error && !notFound && (
              <Card className="p-16 text-center border-0 shadow-xl bg-gradient-to-br from-gray-50 to-white">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-6">
                  <Search className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Search for an Order</h3>
                <p className="text-gray-600 text-lg max-w-md mx-auto">
                  Enter an Order ID in the search box above to view detailed order information
                </p>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
