"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { useClientContext } from "@/context/client-context"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./mode-toggle"
import NotificationCenter from "./notification/notification-center"
import { cn } from "@/lib/utils"
import {
  Home,
  Users,
  ShoppingBag,
  Wallet,
  ArrowDownCircle,
  Settings,
  LogOut,
  User,
  BarChart3,
  Shield,
  Menu,
  FileText,
  X,
  ChevronRight,
  ChevronDown,
  Database,
  ReceiptText,
  LineChart,
  Cog,
  LayoutDashboard,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import OfflineDetector from "./offline-detector"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import React from "react"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

interface NavItemProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
  active: boolean
  onClick: () => void
  badge?: React.ReactNode
  collapsed?: boolean
}

const NavItem = React.memo(({ icon: Icon, label, active, onClick, badge, collapsed }: NavItemProps) => {
  return (
    <Button
      variant={active ? "default" : "ghost"}
      className={cn(
        "w-full justify-start transition-all duration-200 group pl-3 pr-2 py-2 h-auto",
        active ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted",
      )}
      onClick={onClick}
    >
      <div className="flex-shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div className="ml-3 flex items-center justify-between w-full">
        <span className="text-sm">{label}</span>
        {badge && badge}
      </div>
    </Button>
  )
})

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(isMobileInit())
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState({
    dashboard: true,
    clientData: true,
    transactions: true,
    analytics: true,
    system: true,
  })
  const router = useRouter()
  const { user, logout, isAdmin, isViewer } = useAuth()
  const { orderRequests } = useClientContext()

  // Calculate pending order requests
  const pendingOrderRequests = orderRequests?.filter((request) => request.status === "Pending")?.length || 0

  function isMobileInit() {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768
    }
    return false
  }

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setCollapsed(true)
      }
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  // Make sure the navigateTo function properly handles the dashboard case
  const navigateTo = (tab: string) => {
    if (tab === "dashboard") {
      router.push("/")
      setActiveTab("dashboard")
    } else {
      router.push(`/?tab=${tab}`)
      setActiveTab(tab)
    }

    // Close mobile menu if open
    if (isMobile) {
      setIsSheetOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
  }

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase()
  }

  // Get avatar based on role
  const getAvatarContent = () => {
    const customAvatar = localStorage.getItem("userAvatar")

    if (customAvatar) {
      return <AvatarImage src={customAvatar} alt="User avatar" />
    }

    if (isAdmin) {
      return (
        <AvatarFallback className="bg-primary text-primary-foreground">
          <Shield className="h-5 w-5" />
        </AvatarFallback>
      )
    } else if (isViewer) {
      return (
        <AvatarFallback className="bg-gray-700 text-white">
          <User className="h-5 w-5" />
        </AvatarFallback>
      )
    } else {
      return (
        <AvatarFallback className="bg-gray-500 text-white">{user ? getInitials(user.username) : "?"}</AvatarFallback>
      )
    }
  }

  // Create order request badge
  const orderRequestBadge =
    pendingOrderRequests > 0 ? (
      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-auto">{pendingOrderRequests}</span>
    ) : null

  // Toggle group expansion
  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }))
  }

  const handleTabChange = useCallback(
    (tab: string) => {
      setActiveTab(tab)
      router.push(`/?tab=${tab}`)
    },
    [router, setActiveTab],
  )

  const toggleCollapse = useCallback(() => {
    setCollapsed(!collapsed)
    localStorage.setItem("sidebarCollapsed", String(!collapsed))
  }, [collapsed])

  // Define navigation structure
  const navStructure = [
    {
      title: "Dashboard",
      id: "dashboard",
      icon: <Home className="h-4 w-4" />,
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: <Home className="h-5 w-5" />,
        },
      ],
    },
    {
      title: "Client Data",
      id: "clientData",
      icon: <Database className="h-4 w-4" />,
      items: [
        {
          id: "clients",
          label: "Clients",
          icon: <Users className="h-5 w-5" />,
        },
      ],
    },
    {
      title: "Transactions",
      id: "transactions",
      icon: <ReceiptText className="h-4 w-4" />,
      items: [
        {
          id: "orders",
          label: "Orders",
          icon: <ShoppingBag className="h-5 w-5" />,
        },
        {
          id: "order-requests",
          label: "Order Requests",
          icon: <FileText className="h-5 w-5" />,
          badge: orderRequestBadge,
        },
        {
          id: "deposits",
          label: "Deposits",
          icon: <Wallet className="h-5 w-5" />,
        },
        {
          id: "withdrawals",
          label: "Withdrawals",
          icon: <ArrowDownCircle className="h-5 w-5" />,
        },
      ],
    },
    {
      title: "Analytics",
      id: "analytics",
      icon: <LineChart className="h-4 w-4" />,
      items: [
        {
          id: "team",
          label: "Team Performance",
          icon: <BarChart3 className="h-5 w-5" />,
        },
        {
          id: "reports",
          label: "Reports",
          icon: <FileText className="h-5 w-5" />,
        },
      ],
    },
    {
      title: "System",
      id: "system",
      icon: <Cog className="h-4 w-4" />,
      items: [
        {
          id: "settings",
          label: "Settings",
          icon: <Settings className="h-5 w-5" />,
        },
      ],
    },
  ]

  // Remove conditional that was hiding the System section from viewers
  // if (!isViewer) {
  //   navStructure.push({
  //     title: "System",
  //     id: "system",
  //     icon: <Cog className="h-4 w-4" />,
  //     items: [
  //       {
  //         id: "settings",
  //         label: "Settings",
  //         icon: <Settings className="h-5 w-5" />,
  //       },
  //     ],
  //   })
  // }

  const navigationSections = useMemo(
    () => [
      {
        title: "Dashboard",
        items: [
          {
            icon: LayoutDashboard,
            label: "Dashboard",
            tab: "dashboard",
            onClick: () => handleTabChange("dashboard"),
          },
        ],
      },
      {
        title: "Client Data",
        items: [
          {
            icon: Users,
            label: "Clients",
            tab: "clients",
            onClick: () => handleTabChange("clients"),
          },
        ],
      },
      {
        title: "Transactions",
        items: [
          {
            icon: ShoppingBag,
            label: "Orders",
            tab: "orders",
            onClick: () => handleTabChange("orders"),
          },
          {
            icon: FileText,
            label: "Order Requests",
            tab: "order-requests",
            onClick: () => handleTabChange("order-requests"),
            badge:
              pendingOrderRequests > 0 ? (
                <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                  {pendingOrderRequests}
                </span>
              ) : null,
          },
          {
            icon: Wallet,
            label: "Deposits",
            tab: "deposits",
            onClick: () => handleTabChange("deposits"),
          },
          {
            icon: ArrowDownCircle,
            label: "Withdrawals",
            tab: "withdrawals",
            onClick: () => handleTabChange("withdrawals"),
          },
        ],
      },
      {
        title: "Analytics",
        items: [
          {
            icon: BarChart3,
            label: "Team Performance",
            tab: "team",
            onClick: () => handleTabChange("team"),
          },
          {
            icon: FileText,
            label: "Reports",
            tab: "reports",
            onClick: () => handleTabChange("reports"),
          },
        ],
      },
      {
        title: "System",
        items: [
          {
            icon: Settings,
            label: "Settings",
            tab: "settings",
            onClick: () => handleTabChange("settings"),
          },
        ],
      },
    ],
    [pendingOrderRequests, handleTabChange],
  )

  // Mobile sidebar using Sheet component
  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 z-40 flex items-center h-16 px-4 bg-background border-b w-full">
          <div className="flex items-center">
            <span className="font-bold text-primary text-xl">CMS</span>
          </div>

          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu" className="ml-auto">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0 sm:max-w-sm">
              <div className="flex flex-col h-full">
                {/* Header with close button */}
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="font-bold text-primary text-xl">CMS</div>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" aria-label="Close menu">
                      <X className="h-5 w-5" />
                    </Button>
                  </SheetClose>
                </div>

                {/* User info */}
                <div className="flex items-center p-4 border-b bg-muted/30">
                  <div className="relative">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">{getAvatarContent()}</Avatar>
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">{user?.username}</p>
                    <p className="text-xs text-muted-foreground">{user?.role}</p>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-2">
                  {navStructure.map((group) => (
                    <div key={group.id} className="mb-2">
                      <div
                        className="flex items-center px-4 py-2 text-sm font-medium text-muted-foreground"
                        onClick={() => toggleGroup(group.id)}
                      >
                        {group.icon}
                        <span className="ml-2">{group.title}</span>
                        <ChevronDown
                          className={cn(
                            "ml-auto h-4 w-4 transition-transform duration-200",
                            expandedGroups[group.id as keyof typeof expandedGroups] ? "transform rotate-180" : "",
                          )}
                        />
                      </div>
                      {expandedGroups[group.id as keyof typeof expandedGroups] && (
                        <ul className="mt-1 space-y-1 px-2">
                          {group.items.map((item) => (
                            <li key={item.id}>
                              <Button
                                variant={activeTab === item.id ? "default" : "ghost"}
                                className={cn(
                                  "w-full justify-start transition-all duration-200 group pl-3 pr-2 py-2 h-auto",
                                  activeTab === item.id
                                    ? "bg-primary text-primary-foreground font-medium"
                                    : "hover:bg-muted",
                                )}
                                onClick={() => navigateTo(item.id)}
                              >
                                <div className="flex-shrink-0">{item.icon}</div>
                                <div className="ml-3 flex items-center justify-between w-full">
                                  <span className="text-sm">{item.label}</span>
                                  {item.badge && item.badge}
                                </div>
                              </Button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <OfflineDetector />
                    <NotificationCenter />
                    <ModeToggle />
                  </div>
                  <Button
                    variant="default"
                    className="w-full justify-start bg-gray-800 hover:bg-gray-700 text-white"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Spacer to push content below the fixed header */}
        <div className="h-16"></div>
      </>
    )
  }

  // Desktop sidebar
  return (
    <TooltipProvider>
      <div
        className={`fixed left-0 top-0 z-30 flex h-screen flex-col border-r bg-background transition-all duration-300 ease-in-out ${
          collapsed ? "w-[70px]" : "w-[250px]"
        }`}
        style={{ willChange: "width", contain: "layout" }}
      >
        {/* Logo and collapse button */}
        <div className="flex items-center justify-between p-4 border-b h-16">
          {!collapsed && (
            <div className="flex items-center">
              <span className="font-bold text-primary text-xl">CMS</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn("ml-auto", collapsed && "mx-auto")}
            onClick={toggleCollapse}
          >
            <ChevronRight className={cn("h-5 w-5 transition-transform duration-300", !collapsed && "rotate-180")} />
          </Button>
        </div>

        {/* User info */}
        <div className={cn("flex items-center p-4 border-b bg-muted/30", collapsed ? "justify-center" : "")}>
          <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-primary/20">{getAvatarContent()}</Avatar>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
          </div>
          {!collapsed && (
            <div className="ml-3">
              <p className="font-medium">{user?.username}</p>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navStructure.map((group) => (
            <div key={group.id} className="mb-4">
              {!collapsed && (
                <div
                  className="flex items-center px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleGroup(group.id)}
                >
                  {group.icon}
                  <span className="ml-2">{group.title}</span>
                  <ChevronDown
                    className={cn(
                      "ml-auto h-4 w-4 transition-transform duration-200",
                      expandedGroups[group.id as keyof typeof expandedGroups] ? "transform rotate-180" : "",
                    )}
                  />
                </div>
              )}
              {/* Section headers are not shown when collapsed */}
              {(expandedGroups[group.id as keyof typeof expandedGroups] || collapsed) && (
                <ul className={cn("space-y-1", collapsed ? "px-2 mb-4" : "px-3 mt-1")}>
                  {group.items.map((item) => (
                    <li key={item.id}>
                      {collapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={activeTab === item.id ? "default" : "ghost"}
                              className={cn(
                                "w-full justify-center transition-all duration-200 group p-2",
                                activeTab === item.id
                                  ? "bg-primary text-primary-foreground font-medium"
                                  : "hover:bg-muted",
                              )}
                              onClick={() => navigateTo(item.id)}
                            >
                              <div className="flex items-center justify-center">
                                <div
                                  className={cn(
                                    "flex-shrink-0",
                                    activeTab === item.id ? "" : "text-muted-foreground group-hover:text-foreground",
                                  )}
                                >
                                  {item.icon}
                                </div>
                                {item.badge && <span className="absolute -top-1 -right-1">{item.badge}</span>}
                              </div>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right">{item.label}</TooltipContent>
                        </Tooltip>
                      ) : (
                        <Button
                          variant={activeTab === item.id ? "default" : "ghost"}
                          className={cn(
                            "w-full justify-start transition-all duration-200 group pl-3 pr-2 py-2 h-auto",
                            activeTab === item.id ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted",
                          )}
                          onClick={() => navigateTo(item.id)}
                        >
                          <div className="flex-shrink-0">{item.icon}</div>
                          <div className="ml-3 flex items-center justify-between w-full">
                            <span
                              className={cn(
                                "text-sm",
                                activeTab === item.id ? "" : "text-muted-foreground group-hover:text-foreground",
                              )}
                            >
                              {item.label}
                            </span>
                            {item.badge && item.badge}
                          </div>
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className={cn("p-4 border-t", collapsed ? "flex justify-center" : "")}>
          {!collapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <OfflineDetector />
                <NotificationCenter />
              </div>
              <ModeToggle />
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <OfflineDetector />
              <NotificationCenter />
              <ModeToggle />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Logout</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}

