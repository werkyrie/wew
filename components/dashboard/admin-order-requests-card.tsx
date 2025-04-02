"use client"

import { useEffect, useState } from "react"
import { useClientContext } from "@/context/client-context"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, ArrowRight, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"

export default function AdminOrderRequestsCard() {
  const { orderRequests } = useClientContext()
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [pendingRequests, setPendingRequests] = useState<any[]>([])

  // Calculate pending order requests
  useEffect(() => {
    if (orderRequests) {
      const pending = orderRequests.filter((request) => request.status === "Pending")
      setPendingRequests(pending)
    }
  }, [orderRequests])

  // Only show this card to admins
  if (!isAdmin) return null

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // If no pending requests, show a simplified card
  if (pendingRequests.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-500" />
            Order Requests
          </CardTitle>
          <CardDescription>No pending order requests</CardDescription>
        </CardHeader>
        <CardFooter className="pt-2">
          <Button variant="ghost" size="sm" onClick={() => router.push("/?tab=order-requests")} className="ml-auto">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "bg-gradient-to-br border-2",
        "from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800",
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-500" />
            Order Requests
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => router.push("/?tab=order-requests")}>
            View All <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
        <CardDescription>
          You have {pendingRequests.length} pending order request{pendingRequests.length > 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingRequests.slice(0, 3).map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between p-3 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
            >
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium">{request.clientName}</p>
                  <p className="text-sm text-muted-foreground">{request.shopId}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-amber-100 dark:bg-amber-800/30 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
                      {formatCurrency(request.price)}
                    </span>
                    <span className="text-xs text-slate-500">{format(new Date(request.date), "MMM d, yyyy")}</span>
                  </div>
                </div>
              </div>
              <Button size="sm" onClick={() => router.push(`/?tab=order-requests&view=${request.id}`)}>
                Review
              </Button>
            </div>
          ))}

          {pendingRequests.length > 3 && (
            <Button variant="outline" className="w-full text-xs" onClick={() => router.push("/?tab=order-requests")}>
              View all {pendingRequests.length} requests
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

