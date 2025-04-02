"use client"

import type React from "react"

import { useTeamContext } from "@/context/team-context"
import { Card, CardContent } from "@/components/ui/card"
import { Users, UserPlus, DollarSign, TrendingUp } from "lucide-react"

export default function TeamHeroDashboard() {
  const { metrics } = useTeamContext()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatisticCard
        title="Total Agents"
        value={metrics.totalAgents}
        icon={<Users className="h-5 w-5" />}
        trend={0}
        trendLabel="Active agents"
      />
      <StatisticCard
        title="Total Added Today"
        value={metrics.totalAddedToday}
        icon={<UserPlus className="h-5 w-5" />}
        trend={0}
        trendLabel="New clients today"
      />
      <StatisticCard
        title="Total Deposits"
        value={`$${metrics.totalDeposits.toLocaleString()}`}
        icon={<DollarSign className="h-5 w-5" />}
        trend={0}
        trendLabel="Total deposits"
      />
      <StatisticCard
        title="Net Deposits"
        value={`$${(metrics.totalDeposits - metrics.totalWithdrawals).toLocaleString()}`}
        icon={<TrendingUp className="h-5 w-5" />}
        trend={0}
        trendLabel="Deposits - Withdrawals"
      />
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  className?: string
}

function MetricCard({ title, value, icon, className }: MetricCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className="p-2 rounded-full bg-background shadow-sm">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

interface StatisticCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend: number
  trendLabel: string
}

function StatisticCard({ title, value, icon, trend, trendLabel }: StatisticCardProps) {
  return (
    <Card className="team-metrics-card animate-fade-in shadow-sm hover:shadow-md transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <p className="text-xs text-gray-500">{trendLabel}</p>
          </div>
          <div className="p-2 rounded-full bg-background shadow-sm">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

