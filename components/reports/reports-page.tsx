"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, Trash2, Copy, RefreshCw, Languages, FileText, Download, Upload } from "lucide-react"
import { useAuth } from "@/context/auth-context"

// Client interface
interface Client {
  id: string
  shopId: string
  clientDetails: string
  assets: string
  conversationSummary: string
  planForTomorrow: string
}

// Report data interface
interface ReportData {
  agentName: string
  addedToday: string
  monthlyAdded: string
  openShops: string
  deposits: string
  clients: Client[]
  lastModified: string
}

// Initial empty client template
const emptyClient = (): Client => ({
  id: crypto.randomUUID(),
  shopId: "",
  clientDetails: "",
  assets: "",
  conversationSummary: "",
  planForTomorrow: "",
})

export default function ReportsPage() {
  const { toast } = useToast()
  const { isAdmin } = useAuth()

  // Agent information state
  const [agentName, setAgentName] = useState("")
  const [addedToday, setAddedToday] = useState("")
  const [monthlyAdded, setMonthlyAdded] = useState("")
  const [openShops, setOpenShops] = useState("")
  const [deposits, setDeposits] = useState("")

  // Clients state
  const [clients, setClients] = useState<Client[]>([emptyClient()])

  // Report state
  const [generatedReport, setGeneratedReport] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  // File input ref for JSON import
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Report container ref for scrolling
  const reportContainerRef = useRef<HTMLDivElement>(null)

  // Add a new client
  const addClient = () => {
    setClients([...clients, emptyClient()])
  }

  // Remove a client
  const removeClient = (id: string) => {
    if (clients.length <= 1) {
      toast({
        title: "Cannot remove",
        description: "You must have at least one client in the report",
        variant: "destructive",
      })
      return
    }

    setClients(clients.filter((client) => client.id !== id))
  }

  // Update client field
  const updateClient = (id: string, field: keyof Client, value: string) => {
    setClients(clients.map((client) => (client.id === id ? { ...client, [field]: value } : client)))
  }

  // Generate the report
  const generateReport = () => {
    setIsGenerating(true)

    // Simulate processing delay
    setTimeout(() => {
      let report = `Agent Report - ${new Date().toLocaleDateString()}\n\n`

      // Agent section
      report += `AGENT INFORMATION:\n`
      report += `Name: ${agentName || "Not specified"}\n`
      report += `Added Today: ${addedToday || "0"}\n`
      report += `Monthly Added: ${monthlyAdded || "0"}\n`
      report += `Open Shops: ${openShops || "0"}\n`
      report += `Deposits: ${deposits || "$0"}\n\n`

      // Clients section
      report += `CLIENT INFORMATION:\n\n`

      clients.forEach((client, index) => {
        report += `CLIENT ${index + 1}:\n`
        report += `Shop ID: ${client.shopId || "Not specified"}\n`
        report += `Client Details: ${client.clientDetails || "None"}\n`
        report += `Assets: ${client.assets || "None"}\n`
        report += `Conversation Summary: ${client.conversationSummary || "None"}\n`
        report += `Plan for Tomorrow: ${client.planForTomorrow || "None"}\n\n`
      })

      setGeneratedReport(report)
      setIsGenerating(false)

      // Scroll to the report section
      if (reportContainerRef.current) {
        reportContainerRef.current.scrollIntoView({ behavior: "smooth" })
      }

      toast({
        title: "Report Generated",
        description: "Your report has been successfully generated",
      })
    }, 800)
  }

  // Clear the report
  const clearReport = () => {
    setGeneratedReport("")
    toast({
      title: "Report Cleared",
      description: "The generated report has been cleared",
    })
  }

  // Copy report to clipboard
  const copyToClipboard = () => {
    if (!generatedReport) {
      toast({
        title: "Nothing to copy",
        description: "Please generate a report first",
        variant: "destructive",
      })
      return
    }

    navigator.clipboard
      .writeText(generatedReport)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "Report has been copied to your clipboard",
        })
      })
      .catch(() => {
        toast({
          title: "Copy failed",
          description: "Could not copy to clipboard. Please try again.",
          variant: "destructive",
        })
      })
  }

  // Translate report using Google Translate
  const translateReport = () => {
    if (!generatedReport) {
      toast({
        title: "Nothing to translate",
        description: "Please generate a report first",
        variant: "destructive",
      })
      return
    }

    // Encode the report text for URL
    const encodedText = encodeURIComponent(generatedReport)

    // Open Google Translate in a new tab (English to Chinese)
    window.open(`https://translate.google.com/?sl=en&tl=zh-CN&text=${encodedText}&op=translate`, "_blank")

    toast({
      title: "Opening translator",
      description: "Google Translate is opening in a new tab",
    })
  }

  // Export report data as JSON
  const exportAsJson = () => {
    // Create report data object
    const reportData: ReportData = {
      agentName,
      addedToday,
      monthlyAdded,
      openShops,
      deposits,
      clients,
      lastModified: new Date().toISOString(),
    }

    // Convert to JSON string
    const jsonString = JSON.stringify(reportData, null, 2)

    // Create blob and download link
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    // Create temporary link and trigger download
    const link = document.createElement("a")
    link.href = url
    link.download = `agent-report-${new Date().toLocaleDateString().replace(/\//g, "-")}.json`
    document.body.appendChild(link)
    link.click()

    // Clean up
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Report Exported",
      description: "Your report has been exported as a JSON file",
    })
  }

  // Trigger file input click for JSON import
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Import report data from JSON file
  const importFromJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const reportData = JSON.parse(content) as ReportData

        // Validate the imported data
        if (!reportData || typeof reportData !== "object") {
          throw new Error("Invalid report data format")
        }

        // Update state with imported data
        setAgentName(reportData.agentName || "")
        setAddedToday(reportData.addedToday || "")
        setMonthlyAdded(reportData.monthlyAdded || "")
        setOpenShops(reportData.openShops || "")
        setDeposits(reportData.deposits || "")

        // Ensure each client has an ID
        const importedClients = reportData.clients?.map((client) => ({
          ...client,
          id: client.id || crypto.randomUUID(),
        })) || [emptyClient()]

        setClients(importedClients)

        toast({
          title: "Report Imported",
          description: `Successfully imported report from ${file.name}`,
        })
      } catch (error) {
        console.error("Error importing report:", error)
        toast({
          title: "Import Failed",
          description: "The selected file contains invalid data",
          variant: "destructive",
        })
      }
    }

    reader.onerror = () => {
      toast({
        title: "Import Failed",
        description: "An error occurred while reading the file",
        variant: "destructive",
      })
    }

    reader.readAsText(file)

    // Reset file input
    if (event.target) {
      event.target.value = ""
    }
  }

  // Load saved data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("agentReportData")
    if (savedData) {
      try {
        const data = JSON.parse(savedData)
        setAgentName(data.agentName || "")
        setAddedToday(data.addedToday || "")
        setMonthlyAdded(data.monthlyAdded || "")
        setOpenShops(data.openShops || "")
        setDeposits(data.deposits || "")
        setClients(data.clients || [emptyClient()])
      } catch (e) {
        console.error("Error loading saved data:", e)
      }
    }
  }, [])

  // Save data to localStorage when it changes
  useEffect(() => {
    const dataToSave = {
      agentName,
      addedToday,
      monthlyAdded,
      openShops,
      deposits,
      clients,
    }

    localStorage.setItem("agentReportData", JSON.stringify(dataToSave))
  }, [agentName, addedToday, monthlyAdded, openShops, deposits, clients])

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Agent Reports</h1>
        <p className="text-muted-foreground mt-2">Create detailed agent and client reports</p>
      </div>

      {/* Agent Information Section */}
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="bg-muted/30">
          <CardTitle>Agent Information</CardTitle>
          <CardDescription>Enter your agent details for the report</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="agentName" className="text-sm font-medium">
                Agent Name
              </label>
              <Input
                id="agentName"
                placeholder="Enter agent name"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="addedToday" className="text-sm font-medium">
                Added Today
              </label>
              <Input
                id="addedToday"
                placeholder="Number of clients added today"
                value={addedToday}
                onChange={(e) => setAddedToday(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="monthlyAdded" className="text-sm font-medium">
                Monthly Added
              </label>
              <Input
                id="monthlyAdded"
                placeholder="Number of clients added this month"
                value={monthlyAdded}
                onChange={(e) => setMonthlyAdded(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="openShops" className="text-sm font-medium">
                Open Shops
              </label>
              <Input
                id="openShops"
                placeholder="Number of open shops"
                value={openShops}
                onChange={(e) => setOpenShops(e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="deposits" className="text-sm font-medium">
                Deposits
              </label>
              <Input
                id="deposits"
                placeholder="Total deposits amount"
                value={deposits}
                onChange={(e) => setDeposits(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Client Information</h2>
          <Button onClick={addClient} size="sm" className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        </div>

        {clients.map((client, index) => (
          <Card key={client.id} className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-muted/30 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Client {index + 1}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeClient(client.id)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove client</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Information</TabsTrigger>
                  <TabsTrigger value="plan">Plan</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor={`shopId-${client.id}`} className="text-sm font-medium">
                      Shop ID
                    </label>
                    <Input
                      id={`shopId-${client.id}`}
                      placeholder="Enter shop ID"
                      value={client.shopId}
                      onChange={(e) => updateClient(client.id, "shopId", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor={`clientDetails-${client.id}`} className="text-sm font-medium">
                      Client Details
                    </label>
                    <Textarea
                      id={`clientDetails-${client.id}`}
                      placeholder="Enter client details"
                      value={client.clientDetails}
                      onChange={(e) => updateClient(client.id, "clientDetails", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor={`assets-${client.id}`} className="text-sm font-medium">
                      Assets
                    </label>
                    <Textarea
                      id={`assets-${client.id}`}
                      placeholder="Enter client assets"
                      value={client.assets}
                      onChange={(e) => updateClient(client.id, "assets", e.target.value)}
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="plan" className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor={`conversationSummary-${client.id}`} className="text-sm font-medium">
                      Conversation Summary
                    </label>
                    <Textarea
                      id={`conversationSummary-${client.id}`}
                      placeholder="Summarize your conversation"
                      value={client.conversationSummary}
                      onChange={(e) => updateClient(client.id, "conversationSummary", e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor={`planForTomorrow-${client.id}`} className="text-sm font-medium">
                      Plan for Tomorrow
                    </label>
                    <Textarea
                      id={`planForTomorrow-${client.id}`}
                      placeholder="What's the plan for tomorrow?"
                      value={client.planForTomorrow}
                      onChange={(e) => updateClient(client.id, "planForTomorrow", e.target.value)}
                      rows={4}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Generation Section */}
      <Card className="shadow-sm" ref={reportContainerRef}>
        <CardHeader className="bg-muted/30">
          <CardTitle>Generated Report</CardTitle>
          <CardDescription>Generate and manage your report</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3 mb-6">
            <Button onClick={generateReport} disabled={isGenerating} className="flex items-center gap-2">
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={clearReport}
              disabled={!generatedReport || isGenerating}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Clear
            </Button>

            <Button
              variant="outline"
              onClick={translateReport}
              disabled={!generatedReport || isGenerating}
              className="flex items-center gap-2"
            >
              <Languages className="h-4 w-4" />
              Translate
            </Button>

            <Button
              variant="outline"
              onClick={copyToClipboard}
              disabled={!generatedReport || isGenerating}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>

            <Button variant="outline" onClick={exportAsJson} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export JSON
            </Button>

            <Button variant="outline" onClick={triggerFileInput} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import JSON
            </Button>

            {/* Hidden file input for JSON import */}
            <input type="file" ref={fileInputRef} onChange={importFromJson} accept=".json" className="hidden" />
          </div>

          <div className="border rounded-md p-4 min-h-[200px] bg-muted/20 font-mono text-sm whitespace-pre-wrap">
            {generatedReport || "Your generated report will appear here..."}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

