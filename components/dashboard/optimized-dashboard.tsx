"use client"
import WelcomeHero from "@/components/dashboard/welcome-hero"
import OptimizedStatisticsGrid from "@/components/dashboard/optimized-statistics-grid"
import TopAgentsCard from "@/components/dashboard/top-agents-card"
import AdminOrderRequestsCard from "@/components/dashboard/admin-order-requests-card"
import { useAuth } from "@/context/auth-context"

export default function OptimizedDashboardPage() {
  const { isAdmin } = useAuth()

  return (
    <div className="container mx-auto p-4 space-y-6">
      <WelcomeHero />

      <OptimizedStatisticsGrid />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopAgentsCard />
        {isAdmin && <AdminOrderRequestsCard />}
      </div>
    </div>
  )
}

