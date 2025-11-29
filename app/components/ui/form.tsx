import * as React from "react"

interface FormItemContextValue {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue)

export const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={`space-y-2 ${className || ""}`} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

export const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={`text-sm font-medium text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ""}`}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

export const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => {
  const { id } = React.useContext(FormItemContext)

  return (
    <div ref={ref} id={id} {...props} />
  )
})
FormControl.displayName = "FormControl"

export const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  if (!children) {
    return null
  }

  return (
    <p
      ref={ref}
      className={`text-sm font-medium text-red-600 ${className || ""}`}
      {...props}
    >
      {children}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

export const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={`text-sm text-gray-500 ${className || ""}`}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"