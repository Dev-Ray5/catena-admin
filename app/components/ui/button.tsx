import * as React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    
    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600",
      destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
      outline: "border border-gray-300 bg-white hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-400",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-400",
      ghost: "hover:bg-gray-100 hover:text-gray-900",
      link: "text-blue-600 underline-offset-4 hover:underline"
    }
    
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3 text-sm",
      lg: "h-11 rounded-md px-8 text-lg",
      icon: "h-10 w-10"
    }
    
    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }

// Demo
export default function ButtonDemo() {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleClick = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Button Component</h1>
          <p className="text-gray-600">A versatile button component with multiple variants and sizes</p>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Variants</h2>
            <div className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Sizes</h2>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">States</h2>
            <div className="flex flex-wrap gap-4">
              <Button disabled={isLoading} onClick={handleClick}>
                {isLoading ? "Loading..." : "Click Me"}
              </Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Auth Form Example</h2>
            <div className="max-w-md space-y-4">
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button className="w-full">Sign In</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}