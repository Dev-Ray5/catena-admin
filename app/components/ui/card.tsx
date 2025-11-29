import * as React from "react"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-lg border border-gray-200 bg-white text-gray-950 ${className}`}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col space-y-1.5 p-6 ${className}`}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className = "", ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className = "", ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-gray-500 ${className}`}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`flex items-center p-6 pt-0 ${className}`}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

// Demo
export default function CardDemo() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="space-y-8 w-full max-w-2xl">
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle>Card Component</CardTitle>
            <CardDescription>A flexible card component for your UI</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              This card component can be used to wrap content with a clean, bordered container.
              It includes subcomponents for header, title, description, content, and footer.
            </p>
          </CardContent>
          <CardFooter>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Action Button
            </button>
          </CardFooter>
        </Card>

        <Card className="w-full max-w-md mx-auto shadow-lg">
          <div className="p-8 space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-blue-600">Example Card</h2>
              <p className="text-sm text-gray-600 mt-2">Similar to your auth form layout</p>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Example input"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg">
                Submit
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}