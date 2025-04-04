"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useClientContext } from "@/context/client-context"
import { useTheme } from "next-themes"

export default function WelcomeHero() {
  const { clients, orders, deposits, withdrawals } = useClientContext()
  const [currentTime, setCurrentTime] = useState(new Date())
  const { theme } = useTheme()

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

  // Memoize summary text to avoid recalculation
  const summaryText = useMemo(() => {
    return `Welcome to your Team Hotel Management Dashboard. You are currently managing ${clients.length} clients,
    ${orders.length} orders, ${deposits.length} deposits, and ${withdrawals.length} withdrawals.`
  }, [clients.length, orders.length, deposits.length, withdrawals.length])

  // Memoize card background style
  const cardStyle = useMemo(() => {
    return {
      background:
        theme === "dark"
          ? "linear-gradient(to right, rgb(31, 41, 55), rgb(17, 24, 39))"
          : "linear-gradient(to right, rgb(239, 246, 255), rgb(238, 242, 255))",
      contain: "content",
    }
  }, [theme])

  return (
    <Card className="border-none shadow-sm mb-6" style={cardStyle}>
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl font-bold">{greeting}!</CardTitle>
        <CardDescription className="text-base">
          {formattedDate} • {formattedTime}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{summaryText}</p>
      </CardContent>
    </Card>
  )
}

