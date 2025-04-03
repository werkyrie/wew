"use client"

import type React from "react"

import { useTeamContext } from "@/context/team-context"
import { Card, CardContent } from "@/components/ui/card"
import { Users, CalendarPlus, Calendar, Briefcase, Wallet, TrendingUp, TrendingDown } from "lucide-react"

export default function TeamHeroDashboard() {
  const { metrics } = useTeamContext()

  // Sample trend data (you can replace with actual data)
  const trends = {
    totalAgents: { value: 5.2, positive: true },
    totalAddedToday: { value: 12.8, positive: true },
    totalMonthlyAdded: { value: 8.3, positive: true },
    totalOpenAccounts: { value: 2.1, positive: false },
    totalDeposits: { value: 7.5, positive: true },
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <MetricCard
        title="Total Agents"
        value={metrics.totalAgents}
        icon={<Users className="h-5 w-5 text-blue-500" />}
        trend={trends.totalAgents}
        className="team-metrics-card animate-fade-in shadow-sm hover:shadow-lg transition-all duration-300"
        bgColor="bg-blue-50 dark:bg-blue-950/40"
        iconBgColor="bg-blue-100 dark:bg-blue-900/50"
      />

      <MetricCard
        title="Added Today"
        value={metrics.totalAddedToday}
        icon={<CalendarPlus className="h-5 w-5 text-green-500" />}
        trend={trends.totalAddedToday}
        className="team-metrics-card animate-fade-in shadow-sm hover:shadow-lg transition-all duration-300"
        bgColor="bg-green-50 dark:bg-green-950/40"
        iconBgColor="bg-green-100 dark:bg-green-900/50"
      />

      <MetricCard
        title="Monthly Added"
        value={metrics.totalMonthlyAdded}
        icon={<Calendar className="h-5 w-5 text-purple-500" />}
        trend={trends.totalMonthlyAdded}
        className="team-metrics-card animate-fade-in shadow-sm hover:shadow-lg transition-all duration-300"
        bgColor="bg-purple-50 dark:bg-purple-950/40"
        iconBgColor="bg-purple-100 dark:bg-purple-900/50"
      />

      <MetricCard
        title="Open Accounts"
        value={metrics.totalOpenAccounts}
        icon={<Briefcase className="h-5 w-5 text-amber-500" />}
        trend={trends.totalOpenAccounts}
        className="team-metrics-card animate-fade-in shadow-sm hover:shadow-lg transition-all duration-300"
        bgColor="bg-amber-50 dark:bg-amber-950/40"
        iconBgColor="bg-amber-100 dark:bg-amber-900/50"
      />

      <MetricCard
        title="Total Deposits"
        value={`$${metrics.totalDeposits.toLocaleString()}`}
        icon={<Wallet className="h-5 w-5 text-emerald-500" />}
        trend={trends.totalDeposits}
        className="team-metrics-card animate-fade-in shadow-sm hover:shadow-lg transition-all duration-300"
        bgColor="bg-emerald-50 dark:bg-emerald-950/40"
        iconBgColor="bg-emerald-100 dark:bg-emerald-900/50"
      />
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend: { value: number; positive: boolean }
  className?: string
  bgColor: string
  iconBgColor: string
}

function MetricCard({ title, value, icon, trend, className, bgColor, iconBgColor }: MetricCardProps) {
  return (
    <Card className={`${className} ${bgColor} border-0 overflow-hidden`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>

            {/* Trend indicator */}
            <div
              className={`flex items-center mt-2 text-xs font-medium ${
                trend.positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              {trend.positive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              <span>{trend.value}% from last period</span>
            </div>
          </div>
          <div
            className={`p-3 rounded-full ${iconBgColor} shadow-sm transform transition-transform hover:scale-105 duration-300`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

