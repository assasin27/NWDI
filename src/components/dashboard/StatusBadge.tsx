import { CheckCircle2, Clock, XCircle, AlertTriangle, Loader2, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    iconClassName: 'text-yellow-500',
  },
  processing: {
    label: 'Processing',
    icon: Loader2,
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    iconClassName: 'text-blue-500 animate-spin',
  },
  shipped: {
    label: 'Shipped',
    icon: Package,
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    iconClassName: 'text-indigo-500',
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle2,
    className: 'bg-green-50 text-green-700 border-green-200',
    iconClassName: 'text-green-500',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    className: 'bg-red-50 text-red-700 border-red-200',
    iconClassName: 'text-red-500',
  },
  low_stock: {
    label: 'Low Stock',
    icon: AlertTriangle,
    className: 'bg-orange-50 text-orange-700 border-orange-200',
    iconClassName: 'text-orange-500',
  },
  out_of_stock: {
    label: 'Out of Stock',
    icon: XCircle,
    className: 'bg-red-50 text-red-700 border-red-200',
    iconClassName: 'text-red-500',
  },
  default: {
    label: 'Unknown',
    icon: null,
    className: 'bg-gray-50 text-gray-700 border-gray-200',
    iconClassName: 'text-gray-500',
  },
} as const;

export function StatusBadge({ status, className, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.default;
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border font-medium whitespace-nowrap',
        sizeClasses[size],
        config.className,
        className
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            'mr-1.5 h-3 w-3',
            size === 'sm' && 'h-2.5 w-2.5 mr-1',
            size === 'lg' && 'h-4 w-4 mr-2',
            config.iconClassName
          )}
        />
      )}
      {config.label}
    </div>
  );
}

// Helper component for order status badges
export function OrderStatusBadge({ status, className, size = 'md' }: StatusBadgeProps) {
  return <StatusBadge status={status} className={className} size={size} />;
}

// Helper component for stock status badges
export function StockStatusBadge({ status, className, size = 'md' }: StatusBadgeProps) {
  return <StatusBadge status={status} className={className} size={size} />;
}
