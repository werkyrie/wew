"use client"

import { useState } from "react"
import { useClientContext } from "@/context/client-context"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  DollarSign,
  User,
  Store,
  MessageSquare,
  Trash2,
  ClipboardCopy,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { OrderRequest, OrderRequestStatus } from "@/types/client"
import { formatCurrency, formatDate } from "@/utils/format-helpers"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent } from "@/components/ui/card"

interface OrderRequestCardProps {
  request: OrderRequest
}

export default function OrderRequestCard({ request }: OrderRequestCardProps) {
  const { updateOrderRequestStatus, deleteOrderRequest } = useClientContext()
  const { isAdmin } = useAuth()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // Get status badge variant
  const getStatusVariant = (status: OrderRequestStatus): "default" | "outline" | "secondary" | "destructive" => {
    switch (status) {
      case "Pending":
        return "secondary"
      case "Approved":
        return "default"
      case "Rejected":
        return "destructive"
      default:
        return "outline"
    }
  }

  // Handle status update
  const handleStatusUpdate = (status: OrderRequestStatus) => {
    setIsUpdating(true)

    // Simulate a delay for better UX
    setTimeout(() => {
      updateOrderRequestStatus(request.id, status)

      toast({
        title: `Request ${status}`,
        description: `Order request has been ${status.toLowerCase()}.`,
        variant: status === "Approved" ? "success" : status === "Rejected" ? "destructive" : "default",
      })

      setIsUpdating(false)
    }, 500)
  }

  // Handle delete request
  const handleDeleteRequest = () => {
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    deleteOrderRequest(request.id)
    toast({
      title: "Request Deleted",
      description: "Order request has been deleted successfully.",
      variant: "default",
    })
    setIsDeleteDialogOpen(false)
  }

  // Handle copy information
  const handleCopyInformation = () => {
    // Create a detailed message with order request information
    const message = `
🛍️ Order Request
👤 Client: ${request.clientName}
🏪 Shop ID: ${request.shopId}
📍 Location: ${request.location}
💰 Price: ${formatCurrency(request.price || 0)}
📅 Date: ${formatDate(request.date)}
🔄 Status: ${request.status}
${request.remarks ? `💬 Remarks: ${request.remarks}` : ""}
`.trim()

    // Copy to clipboard
    navigator.clipboard.writeText(message)

    toast({
      title: "Information Copied",
      description: "Order details copied to clipboard!",
    })
  }

  return (
    <TooltipProvider>
      <Card className="shadow-sm hover:shadow transition-shadow duration-200">
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Store className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">{request.shopId}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{request.clientName}</p>
            </div>
            <Badge variant={getStatusVariant(request.status as OrderRequestStatus)}>{request.status}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formatDate(request.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{formatCurrency(request.price || 0)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{request.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{request.agent}</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full flex items-center justify-center gap-1 mt-1"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? (
              <>
                <ChevronUp className="h-4 w-4" />
                <span>Hide details</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                <span>Show details</span>
              </>
            )}
          </Button>

          {showDetails && (
            <div className="mt-3 pt-3 border-t">
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Remarks</span>
                </div>
                <div className="bg-muted/30 p-3 rounded text-sm">
                  {request.remarks ? (
                    request.remarks
                  ) : (
                    <span className="italic text-muted-foreground">No remarks provided</span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-end">
                {isAdmin && request.status === "Pending" && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9"
                          onClick={() => handleStatusUpdate("Rejected")}
                          disabled={isUpdating}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Reject this request</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="default"
                          size="sm"
                          className="h-9"
                          onClick={() => handleStatusUpdate("Approved")}
                          disabled={isUpdating}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Approve this request</TooltipContent>
                    </Tooltip>
                  </>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9" onClick={handleCopyInformation}>
                      <ClipboardCopy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy request information</TooltipContent>
                </Tooltip>

                {isAdmin && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9" onClick={handleDeleteRequest}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete this request</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the order request. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  )
}

