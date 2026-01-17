import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

/**
 * Tooltip Components
 * 
 * A set of components for displaying contextual information on hover or focus.
 * Built on top of Radix UI's Tooltip primitive with smooth animations.
 * 
 * @module Tooltip
 * 
 * @example
 * ```tsx
 * <TooltipProvider>
 *   <Tooltip>
 *     <TooltipTrigger asChild>
 *       <Button variant="outline">Hover me</Button>
 *     </TooltipTrigger>
 *     <TooltipContent>
 *       <p>Helpful information here</p>
 *     </TooltipContent>
 *   </Tooltip>
 * </TooltipProvider>
 * ```
 * 
 * **Features:**
 * - Smooth fade and zoom animations
 * - Automatic positioning with collision detection
 * - Keyboard accessible (ESC to close)
 * - Touch-friendly with configurable delay
 * - Support for rich content (not just text)
 * 
 * **Responsive Behavior:**
 * - Automatically adjusts position on small screens
 * - Configurable offset from trigger element
 * - Portal rendering for z-index management
 */

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

/**
 * TooltipContent
 * 
 * The content container for the tooltip. Automatically positions itself
 * relative to the trigger and includes smooth animations.
 * 
 * @component
 * @param {number} [sideOffset=4] - Distance in pixels from the trigger element
 * @param {string} [className] - Additional CSS classes
 */
const TooltipContent = React.forwardRef<
	React.ElementRef<typeof TooltipPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
	<TooltipPrimitive.Content
		ref={ref}
		sideOffset={sideOffset}
		className={cn(
			"z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
			className,
		)}
		{...props}
	/>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
