"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Package, Boxes, CheckCircle, LogOut, Menu, X } from "lucide-react"
import { signOut } from "firebase/auth"
import { auth } from "@/app/lib/firebase"
import { useState } from "react"

interface SidebarProps {
  username: string
}

const menuItems = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "New Product", href: "/dashboard/new-product", icon: Package },
  { label: "Manage Products", href: "/dashboard/manage-products", icon: Boxes },
  { label: "Verify Orders", href: "/dashboard/verify-orders", icon: CheckCircle },
]

export function Sidebar({ username }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut(auth)
      window.location.href = "/login"
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary text-white"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setIsOpen(false)} />}

      <div
        className={`fixed md:relative w-64 bg-primary text-white h-screen flex flex-col z-40 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-primary/30">
          <h1 className="text-xl font-bold">Catena LTD</h1>
          <p className="text-sm text-blue-100 mt-2">Store Management</p>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 bg-primary/80">
          <p className="text-sm font-medium">Welcome</p>
          <p className="text-lg font-bold truncate">{username}</p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? "bg-white text-primary font-medium" : "text-blue-100 hover:bg-primary/80"
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-primary/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 transition-colors text-white font-medium"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  )
}
