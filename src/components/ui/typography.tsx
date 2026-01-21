import React from 'react';
import { cn } from "@/lib/utils";

// --- TÍTULOS ---

export const H1 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
	({ className, children, ...props }, ref) => {
		return (
			<h1 
				ref={ref}
				className={cn(
					"scroll-m-20 text-2xl md:text-3xl lg:text-4xl font-bold font-display tracking-tight text-foreground transition-all",
					className
				)} 
				{...props}
			>
				{children}
			</h1>
		);
	}
);
H1.displayName = "H1";

export const H2 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
	({ className, children, ...props }, ref) => {
		return (
			<h2 
				ref={ref}
				className={cn(
					"scroll-m-20 text-xl md:text-2xl font-bold font-display tracking-tight text-foreground first:mt-0 transition-all",
					className
				)} 
				{...props}
			>
				{children}
			</h2>
		);
	}
);
H2.displayName = "H2";

export const H3 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
	({ className, children, ...props }, ref) => {
		return (
			<h3 
				ref={ref}
				className={cn(
					"scroll-m-20 text-lg md:text-xl font-bold font-display tracking-tight text-foreground transition-all",
					className
				)} 
				{...props}
			>
				{children}
			</h3>
		);
	}
);
H3.displayName = "H3";

// --- TEXTOS ---

export const P = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
	({ className, children, ...props }, ref) => {
		return (
			<p 
				ref={ref}
				className={cn("leading-7 [&:not(:first-child)]:mt-6 text-foreground text-sm md:text-base", className)} 
				{...props}
			>
				{children}
			</p>
		);
	}
);
P.displayName = "P";

export const Subtitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
	({ className, children, ...props }, ref) => {
		return (
			<p 
				ref={ref}
				className={cn("text-xs md:text-sm text-muted-foreground", className)} 
				{...props}
			>
				{children}
			</p>
		);
	}
);
Subtitle.displayName = "Subtitle";

export const Small = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
	({ className, children, ...props }, ref) => {
		return (
			<small 
				ref={ref}
				className={cn("text-[10px] md:text-xs font-medium leading-none text-muted-foreground", className)} 
				{...props}
			>
				{children}
			</small>
		);
	}
);
Small.displayName = "Small";