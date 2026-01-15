import React from 'react';
import { cn } from "@/lib/utils";

// --- TÍTULOS ---

export function H1({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1 
      className={cn(
        "scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl font-display text-foreground",
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
        "scroll-m-20 text-2xl font-bold tracking-tight font-display text-foreground first:mt-0",
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
        "scroll-m-20 text-xl font-semibold tracking-tight font-display text-foreground",
        className
      )} 
      {...props}
    >
      {children}
    </h3>
  );
}

// --- TEXTO Y PÁRRAFOS ---

export function P({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p 
      className={cn("leading-7 [&:not(:first-child)]:mt-6 text-foreground/90", className)} 
      {...props}
    >
      {children}
    </p>
  );
}

export function Subtitle({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p 
      className={cn("text-sm text-muted-foreground mt-1", className)} 
      {...props}
    >
      {children}
    </p>
  );
}

export function Small({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <small 
      className={cn("text-xs font-medium leading-none text-muted-foreground", className)} 
      {...props}
    >
      {children}
    </small>
  );
}

// --- ESTILOS ESPECIALES ---

export function Lead({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p 
      className={cn("text-xl text-muted-foreground", className)} 
      {...props}
    >
      {children}
    </p>
  );
}