import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CustomBadgeProps {
  status: number
  className?: string
}

const statusMap: { [key: number]: { label: string; color: string } } = {
  1: { label: "Pending", color: "bg-badge-pending text-white" },
  2: { label: "Confirmed", color: "bg-badge-confirmed text-white" },
  3: { label: "Shipped", color: "bg-badge-shipped text-white" },
  4: { label: "Delivered", color: "bg-badge-delivered text-white" },
  5: { label: "Cancelled", color: "bg-badge-cancelled text-white" },
  6: { label: "Unknown", color: "bg-badge-cancelled text-white" },
}

export function CustomBadge({ status, className }: CustomBadgeProps) {
  const { label, color } = statusMap[status] || { label: "Unknown", color: "bg-gray-500 text-white" }

  return <Badge className={cn(color, className)}>{label}</Badge>
}

