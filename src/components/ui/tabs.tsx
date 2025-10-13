"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

type TabsListProps = React.ComponentProps<typeof TabsPrimitive.List> & {
  variant?: "default" | "underline" | "pill"
}

function TabsList({
  className,
  variant = "default",
  ...props
}: TabsListProps) {
  const baseClass =
    variant === "underline"
      ? "inline-flex h-10 items-end justify-start gap-6 rounded-none bg-transparent p-0 text-muted-foreground w-auto"
      : variant === "pill"
      ? "inline-flex h-10 items-center justify-start gap-1 rounded-lg bg-gray-100 p-1 w-fit"
      : "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]"

  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(baseClass, className)}
      {...props}
    />
  )
}

type TabsTriggerProps = React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  variant?: "default" | "underline" | "pill"
}

function TabsTrigger({
  className,
  variant = "default",
  ...props
}: TabsTriggerProps) {
  const baseClass =
    variant === "underline"
      ? "relative inline-flex items-center justify-center whitespace-nowrap rounded-none px-0 py-0 text-base font-semibold tracking-tight transition-[color] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground after:hidden data-[state=active]:after:block after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-1 after:h-1 after:w-10 after:rounded-full data-[state=active]:after:bg-red-500"
      : variant === "pill"
      ? "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900"
      : "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(baseClass, className)}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
