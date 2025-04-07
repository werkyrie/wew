"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import OrderRequestForm from "./order-request-form"
import OrderRequestList from "./order-request-list"
import { FileText, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function OrderRequestPage() {
  const [activeTab, setActiveTab] = useState("list")

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Order Requests</h2>
        <Button onClick={() => setActiveTab("new")} variant={activeTab === "list" ? "default" : "outline"}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create New Request
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>View Requests</span>
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>New Request</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <OrderRequestList />
        </TabsContent>

        <TabsContent value="new" className="mt-6">
          <Alert className="mb-6 bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900">
            <PlusCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-700 dark:text-green-300">Create a New Order Request</AlertTitle>
            <AlertDescription className="text-green-600 dark:text-green-400">
              Fill out the form below to submit a new order request. All requests will be reviewed by an administrator.
            </AlertDescription>
          </Alert>
          <OrderRequestForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}

