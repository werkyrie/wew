"use client"

import { useState } from "react"
import { useClientContext } from "@/context/client-context"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
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
  ArrowRight,
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

interface OrderRequestCardProps {
  request: OrderRequest
}

export default function OrderRequestCard({ request }: OrderRequestCardProps) {
  const { updateOrderRequestStatus, deleteOrderRequest } = useClientContext()
  const { isAdmin } = useAuth()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)

  // Get status badge color
  const getStatusColor = (status: OrderRequestStatus) => {
    switch (status) {
      case "Pending":
        return "bg-gray-400"
      case "Approved":
        return "bg-gray-900 dark:bg-white"
      case "Rejected":
        return "bg-gray-600"
      default:
        return "bg-gray-500"
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        layout
        className="flip-card-container"
      >
        <div
          className={`flip-card ${isFlipped ? "is-flipped" : ""}`}
          onMouseEnter={() => setIsFlipped(true)}
          onMouseLeave={() => setIsFlipped(false)}
        >
          {/* Front of card */}
          <div className="flip-card-front">
            <div className="relative overflow-hidden border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 shadow-sm hover:shadow-md transition-shadow duration-300 h-full rounded-lg">
              {/* Business card pattern overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(#00000009_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff09_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-70"></div>

              {/* Decorative corner */}
              <div className="absolute top-0 left-0 w-24 h-24 overflow-hidden">
                <div className="absolute transform rotate-45 translate-y-[-85%] translate-x-[-15%] w-[150%] h-6 bg-gray-100 dark:bg-gray-800"></div>
              </div>

              {/* Status indicator */}
              <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                <div
                  className={`absolute transform rotate-45 translate-y-[-50%] w-[150%] h-6 ${
                    request.status === "Approved"
                      ? "bg-gray-900 dark:bg-white"
                      : request.status === "Rejected"
                        ? "bg-gray-600"
                        : "bg-gray-400"
                  }`}
                ></div>
              </div>

              <div className="p-6 relative h-full flex flex-col justify-between">
                {/* Header with logo and shop ID */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 flex items-center justify-center shadow-sm">
                      <Store className="h-5 w-5 text-white dark:text-gray-900" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                        {request.shopId}
                      </h3>
                      <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-medium">
                        Order Request
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="uppercase text-xs tracking-wider font-medium border-gray-300 dark:border-gray-700 px-3 py-1"
                  >
                    {request.status}
                  </Badge>
                </div>

                {/* Main content - business card style */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 flex-grow">
                  <div className="col-span-2">
                    <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">
                      Client
                    </p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">{request.clientName}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">
                      Date
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-full">
                        <Calendar className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(request.date)}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">
                      Price
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-full">
                        <DollarSign className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(request.price || 0)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">
                      Location
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-full">
                        <MapPin className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{request.location}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">
                      Agent
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-full">
                        <User className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{request.agent}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 pt-3 mt-4">
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Hover for details & actions</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back of card */}
          <div className="flip-card-back">
            <div className="relative overflow-hidden border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 shadow-sm hover:shadow-md transition-shadow duration-300 h-full rounded-lg">
              {/* Business card pattern overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(#00000009_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff09_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-70"></div>

              {/* Decorative corner */}
              <div className="absolute top-0 left-0 w-24 h-24 overflow-hidden">
                <div className="absolute transform rotate-45 translate-y-[-85%] translate-x-[-15%] w-[150%] h-6 bg-gray-100 dark:bg-gray-800"></div>
              </div>

              <div className="p-6 relative h-full flex flex-col justify-between">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 flex items-center justify-center shadow-sm">
                      <MessageSquare className="h-5 w-5 text-white dark:text-gray-900" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Details</h3>
                      <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-medium">
                        {request.shopId}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Remarks section */}
                <div className="flex-grow">
                  <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-2">
                    Remarks
                  </p>
                  {request.remarks ? (
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md border border-gray-200 dark:border-gray-800 mb-4 shadow-sm">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{request.remarks}</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md border border-gray-200 dark:border-gray-800 mb-4 shadow-sm">
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">No remarks provided</p>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-3">
                    Actions
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    {isAdmin && request.status === "Pending" && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-11 w-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-800 shadow-sm"
                              onClick={() => handleStatusUpdate("Rejected")}
                              disabled={isUpdating}
                            >
                              <XCircle className="h-5 w-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Reject</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-11 w-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-800 shadow-sm"
                              onClick={() => handleStatusUpdate("Approved")}
                              disabled={isUpdating}
                            >
                              <CheckCircle className="h-5 w-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Approve</TooltipContent>
                        </Tooltip>
                      </>
                    )}

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-11 w-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-800 shadow-sm"
                          onClick={handleCopyInformation}
                        >
                          <ClipboardCopy className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy Information</TooltipContent>
                    </Tooltip>

                    {isAdmin && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-11 w-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-800 shadow-sm"
                            onClick={handleDeleteRequest}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="border border-gray-200 dark:border-gray-800 shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              This will permanently delete the order request. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-200 dark:border-gray-800">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-gray-900 hover:bg-gray-800 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style jsx global>{`
        .flip-card-container {
          perspective: 1000px;
          width: 100%;
          height: 320px;
          margin-bottom: 1rem;
        }
        
        .flip-card {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transform-style: preserve-3d;
          cursor: pointer;
        }
        
        .is-flipped {
          transform: rotateY(180deg);
        }
        
        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          overflow: hidden;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          transition: box-shadow 0.3s ease;
        }
        
        .flip-card-back {
          transform: rotateY(180deg);
        }
        
        .flip-card:hover .flip-card-front,
        .flip-card:hover .flip-card-back {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        @keyframes pulse-border {
          0% {
            box-shadow: 0 0 0 0 rgba(0,0,0,0.1);
          }
          70% {
            box-shadow: 0 0 0 5px rgba(0,0,0,0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(0,0,0,0);
          }
        }
      `}</style>
    </TooltipProvider>
  )
}

