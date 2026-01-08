"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { User } from "@/lib/types"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { AppProvider } from "@/lib/context/app-context"
import { Button } from "@/components/ui/button"
import { Building2, FileText, Users, UserCog, Award, BarChart3, Settings, LogOut, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"

const navigation = [
  { name: "Panel Principal", href: "/dashboard", icon: BarChart3, roles: ["Administrador", "Editor", "Lector"] },
  {
    name: "Identificación de Entes",
    href: "/dashboard/entities",
    icon: Building2,
    roles: ["Administrador", "Editor", "Lector"],
  },
  {
    name: "Marco Normativo",
    href: "/dashboard/regulatory",
    icon: FileText,
    roles: ["Administrador", "Editor", "Lector"],
  },
  {
    name: "Integrantes",
    href: "/dashboard/governing-bodies",
    icon: Users,
    roles: ["Administrador", "Editor", "Lector"],
  },
  {
    name: "Dirección y Representación",
    href: "/dashboard/directors",
    icon: UserCog,
    roles: ["Administrador", "Editor", "Lector"],
  },
  {
    name: "Poderes y Facultades",
    href: "/dashboard/powers",
    icon: Award,
    roles: ["Administrador", "Editor", "Lector"],
  },
  { name: "Reportes", href: "/dashboard/reports", icon: BarChart3, roles: ["Administrador", "Editor", "Lector"] },
  { name: "Gestión de Usuarios", href: "/dashboard/users", icon: Settings, roles: ["Administrador"] },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const userStr = sessionStorage.getItem("currentUser")
    if (!userStr) {
      router.push("/")
    } else {
      setCurrentUser(JSON.parse(userStr))
    }
  }, [router])

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser")
    router.push("/")
  }

  if (!currentUser) {
    return null
  }

  const filteredNavigation = navigation.filter((item) => item.roles.includes(currentUser.role))

  return (
    <ThemeProvider defaultTheme="light">
      <AppProvider>
        <div className="min-h-screen bg-background">
          {/* Mobile sidebar */}
          <div className={cn("fixed inset-0 z-50 lg:hidden", sidebarOpen ? "block" : "hidden")}>
            <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <Image
                  src="/images/logo-20finanzas.png"
                  alt="Secretaría de Finanzas"
                  width={200}
                  height={60}
                  className="w-auto h-12"
                  priority
                />
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <nav className="p-4 space-y-1">
                {filteredNavigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Desktop sidebar */}
          <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
            <div className="flex flex-col flex-grow border-r border-border bg-card overflow-y-auto">
              <div className="flex items-center justify-center p-6 border-b border-border">
                <Image
                  src="/images/logo-20finanzas.png"
                  alt="Secretaría de Finanzas"
                  width={220}
                  height={66}
                  className="w-auto h-14"
                  priority
                />
              </div>
              <nav className="flex-1 p-4 space-y-1">
                {filteredNavigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:pl-64">
            <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-card px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-6 h-6" />
              </Button>
              <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 items-center justify-end">
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground">{currentUser.role}</p>
                  </div>
                  <ThemeToggle />
                  <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar Sesión">
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>
          </div>
        </div>
      </AppProvider>
    </ThemeProvider>
  )
}
