import { cn } from "@/lib/utils";

/**
 * Skeleton Component
 * 
 * A loading placeholder component that displays an animated skeleton UI
 * while content is being loaded. Uses a pulse animation to indicate loading state.
 * 
 * @component
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Standard HTML div attributes
 * @param {string} [props.className] - Additional CSS classes to customize appearance
 * 
 * @example
 * ```tsx
 * // Basic skeleton
 * <Skeleton className="h-4 w-48" />
 * 
 * // Custom sized skeleton
 * <Skeleton className="h-12 w-full rounded-lg" />
 * 
 * // Skeleton for avatar
 * <Skeleton className="h-12 w-12 rounded-full" />
 * ```
 * 
 * **Styling:**
 * - Default: Rounded corners (md), muted background, pulse animation
 * - Customizable via className prop for size, shape, and additional styles
 * 
 * **Accessibility:**
 * - Should be wrapped with appropriate aria-labels in parent components
 * - Automatically inherits ARIA attributes from props
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

export { Skeleton };
