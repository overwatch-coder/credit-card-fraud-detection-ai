"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { AlertTriangle, BarChart3, Home, Menu, Upload } from "lucide-react"

function NavItem({ href, label, icon, isActive, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
        isActive ? "bg-muted font-medium text-primary" : "text-muted-foreground",
      )}
    >
      {icon}
      {label}
    </Link>
  )
}

export function DashboardLayout({ children }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const navItems = [
    {
      href: "/",
      label: "Dashboard",
      icon: <Home className="h-4 w-4" />,
    },
    {
      href: "/predict",
      label: "Single Prediction",
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    {
      href: "/batch",
      label: "Batch Prediction",
      icon: <Upload className="h-4 w-4" />,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2 px-2">
                <BarChart3 className="h-6 w-6" />
                <span className="text-lg font-semibold">Fraud Detection</span>
              </div>
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={pathname === item.href}
                    onClick={() => setOpen(false)}
                  />
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          <span className="text-lg font-semibold hidden md:inline-block">Fraud Detection</span>
        </div>
        <div className="flex-1"></div>
        <ThemeToggle />
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-background md:block">
          <div className="flex h-full flex-col gap-6 p-4">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={pathname === item.href}
                />
              ))}
            </nav>
          </div>
        </aside>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
