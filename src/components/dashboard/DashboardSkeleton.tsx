import { Skeleton } from "@/components/ui/skeleton";

/**
 * DashboardSkeleton Component
 * 
 * Displays a skeleton loading state for the dashboard while data is being fetched.
 * Provides visual feedback to users and improves perceived performance.
 * 
 * @component
 * @example
 * ```tsx
 * <DashboardSkeleton />
 * ```
 * 
 * **Responsive Behavior:**
 * - Mobile (< 640px): Single column layout, smaller heights
 * - Tablet (640px - 1024px): 2-3 column grid
 * - Desktop (> 1024px): 4 column KPIs, full layout
 * 
 * **Accessibility:**
 * - Uses aria-busy and aria-live attributes for screen readers
 * - Provides visual loading indication without blocking interaction
 */
export function DashboardSkeleton() {
	return (
		<div className="space-y-4 animate-fade-in sm:space-y-6" role="status" aria-busy="true" aria-live="polite">
			{/* Header Section */}
			<div className="space-y-2">
				<Skeleton className="hidden h-4 w-48 sm:block" />
				<Skeleton className="h-8 w-64 sm:h-10 sm:w-96" />
				<Skeleton className="h-4 w-48 sm:w-72" />
				<Skeleton className="mt-2 h-3 w-40" />
			</div>

			{/* KPI Cards Grid */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<Skeleton key={i} className="h-32 rounded-xl sm:h-36" />
				))}
			</div>

			{/* Secondary Stats */}
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
				{[1, 2, 3].map((i) => (
					<Skeleton key={i} className="h-24 rounded-xl sm:h-28" />
				))}
			</div>

			{/* Charts Section */}
			<div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
				<Skeleton className="h-[350px] rounded-xl sm:h-[400px]" />
				<Skeleton className="h-[350px] rounded-xl sm:h-[400px]" />
			</div>

			{/* Table and Activity Section */}
			<div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<Skeleton className="h-[400px] rounded-xl sm:h-[500px]" />
				</div>
				<Skeleton className="h-[400px] rounded-xl sm:h-[500px]" />
			</div>

			<span className="sr-only">Cargando dashboard...</span>
		</div>
	);
}
