import React from 'react';
import { cn } from "@/lib/utils";

// --- TÍTULOS ---

export function H1({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
	return (
		<h1 
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

export function H2({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
	return (
		<h2 
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

export function H3({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
	return (
		<h3 
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

// --- TEXTOS ---

export function P({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
	return (
		<p 
			className={cn("leading-7 [&:not(:first-child)]:mt-6 text-foreground text-sm md:text-base", className)} 
			{...props}
		>
			{children}
		</p>
	);
}

export function Subtitle({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
	return (
		<p 
			className={cn("text-xs md:text-sm text-muted-foreground", className)} 
			{...props}
		>
			{children}
		</p>
	);
}

export function Small({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
	return (
		<small 
			className={cn("text-[10px] md:text-xs font-medium leading-none text-muted-foreground", className)} 
			{...props}
		>
			{children}
		</small>
	);
}