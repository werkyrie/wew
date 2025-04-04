"use client"

import { useEffect, useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { useClientContext } from "@/context/client-context"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowUpRight, Calendar, Clock, Users, ShoppingBag, CreditCard, DollarSign, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function WelcomeHero() {
  const router = useRouter()
  const { clients, orders, deposits, withdrawals } = useClientContext()
  const { user } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  const { theme } = useTheme()
  const [showSparkle, setShowSparkle] = useState(false)

  // Memoize greeting calculation
  const greeting = useMemo(() => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }, [currentTime])

  // Memoize date formatting to avoid recalculation
  const formattedDate = useMemo(() => {
    return currentTime.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }, [currentTime])

  // Memoize time formatting
  const formattedTime = useMemo(() => {
    return currentTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }, [currentTime])

  // Optimize time update to only run once per minute
  useEffect(() => {
    // Calculate milliseconds until the next minute
    const now = new Date()
    const nextMinute = new Date(now)
    nextMinute.setMinutes(now.getMinutes() + 1)
    nextMinute.setSeconds(0)
    nextMinute.setMilliseconds(0)
    const delay = nextMinute.getTime() - now.getTime()

    // Set initial timeout to sync with minute boundary
    const initialTimeout = setTimeout(() => {
      setCurrentTime(new Date())

      // Then set interval for every minute
      const timer = setInterval(() => {
        setCurrentTime(new Date())
      }, 60000)

      return () => clearInterval(timer)
    }, delay)

    return () => clearTimeout(initialTimeout)
  }, [])

  // Add sparkle effect on load
  useEffect(() => {
    setShowSparkle(true)
    const timer = setTimeout(() => {
      setShowSparkle(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return "U"
    return user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Get user's display name (username from email, nickname, or first name)
  const getUserDisplayName = () => {
    // If user has an email, extract the username part (before @)
    if (user?.email) {
      const emailParts = user.email.split("@")
      if (emailParts.length > 0) {
        return emailParts[0]
      }
    }

    // Fall back to nickname if available
    if (user?.nickname) return user.nickname

    // Fall back to first name if available
    if (user?.name) return user.name.split(" ")[0]

    // Default fallback
    return "User"
  }

  // Get today's stats
  const todayStats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayClients = clients?.filter((c) => new Date(c.createdAt) >= today).length || 0
    const todayOrders = orders?.filter((o) => new Date(o.date) >= today).length || 0
    const todayDeposits = deposits?.filter((d) => new Date(d.date) >= today).length || 0
    const todayWithdrawals = withdrawals?.filter((w) => new Date(w.date) >= today).length || 0

    const todayDepositAmount =
      deposits?.filter((d) => new Date(d.date) >= today).reduce((sum, d) => sum + d.amount, 0) || 0

    const todayWithdrawalAmount =
      withdrawals?.filter((w) => new Date(w.date) >= today).reduce((sum, w) => sum + w.amount, 0) || 0

    return {
      clients: todayClients,
      orders: todayOrders,
      deposits: todayDeposits,
      withdrawals: todayWithdrawals,
      depositAmount: todayDepositAmount,
      withdrawalAmount: todayWithdrawalAmount,
      netAmount: todayDepositAmount - todayWithdrawalAmount,
    }
  }, [clients, orders, deposits, withdrawals])

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-md overflow-hidden">
        <div className="relative">
          {/* Background gradient with pattern */}
          <div
            className={`absolute inset-0 ${
              theme === "dark"
                ? "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"
                : "bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50"
            }`}
          >
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="hero-pattern" patternUnits="userSpaceOnUse" width="100" height="100">
                    <path d="M0 0h100v100H0z" fill="none" />
                    <path d="M100 0H0v100h100V0zM50 30a20 20 0 110 40 20 20 0 010-40z" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hero-pattern)" />
              </svg>
            </div>
          </div>

          <div className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              {/* Left side - Greeting and user info */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16 border-4 border-background shadow-lg">
                    <AvatarImage src={user?.image} alt={user?.name || "User"} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {showSparkle && (
                    <motion.div
                      className="absolute -top-2 -right-2"
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                      <Sparkles className="h-6 w-6 text-yellow-400 drop-shadow-md" />
                    </motion.div>
                  )}
                </div>
                <div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h1 className="text-2xl md:text-3xl font-bold">
                      {greeting}, {getUserDisplayName()}!
                    </h1>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formattedDate}</span>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Right side - Time and quick actions */}
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 text-lg font-medium">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>{formattedTime}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => router.push("/?tab=clients")}>
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Clients</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => router.push("/?tab=orders")}>
                    <ShoppingBag className="h-4 w-4" />
                    <span className="hidden sm:inline">Orders</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats summary */}
            <motion.div
              className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div
                className={`p-4 rounded-lg ${theme === "dark" ? "bg-slate-800/50" : "bg-white/70"} backdrop-blur-sm border border-slate-200 dark:border-slate-700`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Today's Clients</span>
                </div>
                <div className="text-2xl font-bold">{todayStats.clients}</div>
              </div>

              <div
                className={`p-4 rounded-lg ${theme === "dark" ? "bg-slate-800/50" : "bg-white/70"} backdrop-blur-sm border border-slate-200 dark:border-slate-700`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag className="h-5 w-5 text-indigo-500" />
                  <span className="font-medium">Today's Orders</span>
                </div>
                <div className="text-2xl font-bold">{todayStats.orders}</div>
              </div>

              <div
                className={`p-4 rounded-lg ${theme === "dark" ? "bg-slate-800/50" : "bg-white/70"} backdrop-blur-sm border border-slate-200 dark:border-slate-700`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Today's Deposits</span>
                </div>
                <div className="text-2xl font-bold">{formatCurrency(todayStats.depositAmount)}</div>
              </div>

              <div
                className={`p-4 rounded-lg ${theme === "dark" ? "bg-slate-800/50" : "bg-white/70"} backdrop-blur-sm border border-slate-200 dark:border-slate-700`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-red-500" />
                  <span className="font-medium">Today's Withdrawals</span>
                </div>
                <div className="text-2xl font-bold">{formatCurrency(todayStats.withdrawalAmount)}</div>
              </div>
            </motion.div>

            {/* Net amount for today */}
            <motion.div
              className="mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div
                className={`p-4 rounded-lg ${theme === "dark" ? "bg-slate-800/50" : "bg-white/70"} backdrop-blur-sm border border-slate-200 dark:border-slate-700`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-lg">Today's Net Amount</span>
                  </div>
                  <div
                    className={`text-2xl font-bold ${todayStats.netAmount >= 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {formatCurrency(todayStats.netAmount)}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Card>
    </div>
  )
}

