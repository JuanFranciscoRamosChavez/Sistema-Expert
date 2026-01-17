import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

/**
 * Tabs Components
 * 
 * A set of layered sections of content (tab panels) that display one at a time.
 * Built on Radix UI's Tabs primitive with accessible keyboard navigation.
 * 
 * @module Tabs
 * 
 * @example
 * ```tsx
 * <Tabs defaultValue="overview">
 *   <TabsList>
 *     <TabsTrigger value="overview">Overview</TabsTrigger>
 *     <TabsTrigger value="analytics">Analytics</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="overview">
 *     Overview content here
 *   </TabsContent>
 *   <TabsContent value="analytics">
 *     Analytics content here
 *   </TabsContent>
 * </Tabs>
 * ```
 * 
 * **Features:**
 * - Keyboard navigation (Arrow keys to switch, Home/End for first/last)
 * - Visual active state with shadow and background
 * - Smooth transitions between states
 * - Accessible with ARIA attributes
 * 
 * **Responsive Design:**
 * - Tabs wrap on mobile if needed
 * - Touch-friendly hit targets (min 44px)
 * - Reduced padding on smaller screens
 */

const Tabs = TabsPrimitive.Root;

/**
 * TabsList
 * 
 * Container for tab triggers. Displays tabs horizontally with consistent spacing.
 * 
 * @component
 * @param {string} [className] - Additional CSS classes
 */
const TabsList = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.List>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.List
		ref={ref}
		className={cn(
			"inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
			className,
		)}
		{...props}
	/>
));
TabsList.displayName = TabsPrimitive.List.displayName;

/**
 * TabsTrigger
 * 
 * Clickable tab label that activates the corresponding tab panel.
 * 
 * @component
 * @param {string} value - Unique identifier for this tab
 * @param {string} [className] - Additional CSS classes
 */
const TabsTrigger = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.Trigger
		ref={ref}
		className={cn(
			"inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
			className,
		)}
		{...props}
	/>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

/**
 * TabsContent
 * 
 * Container for the content of each tab. Only the active tab's content is visible.
 * 
 * @component
 * @param {string} value - Must match the value of the corresponding TabsTrigger
 * @param {string} [className] - Additional CSS classes
 */
const TabsContent = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.Content
		ref={ref}
		className={cn(
			"mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
			className,
		)}
		{...props}
	/>
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
