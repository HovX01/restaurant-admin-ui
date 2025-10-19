"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface SidebarContextType {
  collapsed: boolean
  toggle: () => void
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(
  undefined
)

function SidebarProvider({
  defaultCollapsed = false,
  children,
}: {
  defaultCollapsed?: boolean
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("sidebar:collapsed")
      if (stored != null) setCollapsed(stored === "1")
    } catch {}
  }, [])

  const toggle = React.useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem("sidebar:collapsed", next ? "1" : "0")
      } catch {}
      return next
    })
  }, [])

  return (
    <SidebarContext.Provider value={{ collapsed, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

function useSidebar() {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) throw new Error("useSidebar must be used within <SidebarProvider>")
  return ctx
}

function Sidebar({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  const { collapsed } = useSidebar()
  return (
    <aside
      data-collapsed={collapsed ? "true" : "false"}
      className={cn(
        "hidden md:flex h-full flex-col border-r bg-sidebar text-sidebar-foreground overflow-hidden transition-[width] duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {children}
    </aside>
  )
}

function SidebarHeader({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("px-2 py-2", className)}>{children}</div>
}

function SidebarFooter({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("mt-auto p-2", className)}>{children}</div>
}

function SidebarContent({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn("flex-1 overflow-hidden", className)}>
      <ScrollArea className="h-full">{children}</ScrollArea>
    </div>
  )
}

function SidebarSeparator({ className }: { className?: string }) {
  return <div className={cn("my-2 h-px bg-border", className)} />
}

function SidebarMenu({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("space-y-1 px-2", className)}>{children}</div>
}

function SidebarMenuItem({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn(className)}>{children}</div>
}

interface SidebarMenuButtonProps extends React.ComponentProps<"button"> {
  asChild?: boolean
  isActive?: boolean
}

const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, isActive, asChild, children, ...props }, ref) => {
    const Comp: React.ElementType = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        data-active={isActive ? "true" : undefined}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
          "data-[active=true]:bg-secondary data-[active=true]:text-secondary-foreground",
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

function SidebarTrigger({ className }: { className?: string }) {
  const { collapsed, toggle } = useSidebar()
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={className}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {collapsed ? (
        <ChevronRight className="h-4 w-4" />
      ) : (
        <ChevronLeft className="h-4 w-4" />
      )}
    </Button>
  )
}

function SidebarInset({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("flex-1 flex flex-col overflow-hidden", className)}>{children}</div>
}

export {
  SidebarProvider,
  useSidebar,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarTrigger,
  SidebarInset,
}
