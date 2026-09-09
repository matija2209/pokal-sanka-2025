import { cn } from "@/lib/utils"

const sizeMap = {
  mobile: "max-w-[430px]",
  sm: "max-w-lg",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
  full: "max-w-none",
} as const

type ContainerSize = keyof typeof sizeMap

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize
}

export function Container({ size = "mobile", className, children, ...props }: ContainerProps) {
  return (
    <div className={cn("w-full mx-auto px-4", sizeMap[size], className)} {...props}>
      {children}
    </div>
  )
}
