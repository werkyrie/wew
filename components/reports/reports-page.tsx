"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  Loader2,
  Plus,
  Trash2,
  Copy,
  RefreshCw,
  Languages,
  FileText,
  Download,
  Upload,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useTeamContext } from "@/context/team-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

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

interface DateRange {
  from?: Date
  to?: Date
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
  const { agents } = useTeamContext()
  const [reportType, setReportType] = useState<string>("agent-performance")
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: new Date(),
  })
  const [agentName, setAgentName] = useState<string>("")
  const [addedToday, setAddedToday] = useState<number>(0)
  const [monthlyAdded, setMonthlyAdded] = useState<number>(0)
  const [openShops, setOpenShops] = useState<number>(0)
  const [agentDeposits, setAgentDeposits] = useState<number>(0)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [generatedReport, setGeneratedReport] = useState<string>("")
  const reportContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [reportData, setReportData] = useState<any>(null)
  const [reportClients, setReportClients] = useState<Client[]>([emptyClient()])
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0)
  const [clientTabs, setClientTabs] = useState<{ [key: string]: string }>({})
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: boolean }>({})

  // Add a new client
  const addClient = () => {
    const newClient = emptyClient()
    setReportClients([...reportClients, newClient])
    setClientTabs({ ...clientTabs, [newClient.id]: "basic" })
  }

  // Remove a client
  const removeClient = (id: string) => {
    if (reportClients.length <= 1) {
      toast({
        title: "Cannot remove",
        description: "You must have at least one client in the report",
        variant: "destructive",
      })
      return
    }

    setReportClients(reportClients.filter((client) => client.id !== id))

    // Remove from tabs and validation errors
    const newClientTabs = { ...clientTabs }
    delete newClientTabs[id]
    setClientTabs(newClientTabs)

    const newValidationErrors = { ...validationErrors }
    delete newValidationErrors[id]
    setValidationErrors(newValidationErrors)
  }

  // Update client field
  const updateClient = (id: string, field: keyof Client, value: string) => {
    setReportClients(reportClients.map((client) => (client.id === id ? { ...client, [field]: value } : client)))

    // Clear validation error when field is filled
    if (value && validationErrors[id]) {
      const newValidationErrors = { ...validationErrors }
      delete newValidationErrors[id]
      setValidationErrors(newValidationErrors)
    }
  }

  // Set active tab for a client
  const setActiveTab = (clientId: string, tab: string) => {
    setClientTabs({ ...clientTabs, [clientId]: tab })
  }

  // Check if client has plan information
  const clientHasPlanInfo = (client: Client) => {
    return Boolean(client.conversationSummary.trim() && client.planForTomorrow.trim())
  }

  // Validate all clients have plan information
  const validateClientPlans = () => {
    const errors: { [key: string]: boolean } = {}
    let hasErrors = false

    reportClients.forEach((client) => {
      if (!clientHasPlanInfo(client)) {
        errors[client.id] = true
        hasErrors = true
      }
    })

    setValidationErrors(errors)

    if (hasErrors) {
      toast({
        title: "Missing plan information",
        description: "Please fill out the Conversation Summary and Plan for Tomorrow for all clients",
        variant: "destructive",
      })

      // Switch to plan tab for the first client with an error
      const firstErrorId = Object.keys(errors)[0]
      if (firstErrorId) {
        setClientTabs({ ...clientTabs, [firstErrorId]: "plan" })

        // Scroll to the client with error
        const clientElement = document.getElementById(`client-${firstErrorId}`)
        if (clientElement) {
          clientElement.scrollIntoView({ behavior: "smooth" })
        }
      }
    }

    return !hasErrors
  }

  // Generate the report
  const generateReport = () => {
    // Validate plan information first
    if (!validateClientPlans()) {
      return
    }

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
      report += `Deposits: ${agentDeposits || "$0"}\n\n`

      // Clients section
      report += `CLIENT INFORMATION:\n\n`

      reportClients.forEach((client, index) => {
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
      addedToday: addedToday.toString(),
      monthlyAdded: monthlyAdded.toString(),
      openShops: openShops.toString(),
      deposits: agentDeposits.toString(),
      clients: reportClients,
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
        setAddedToday(Number(reportData.addedToday) || 0)
        setMonthlyAdded(Number(reportData.monthlyAdded) || 0)
        setOpenShops(Number(reportData.openShops) || 0)
        setAgentDeposits(Number(reportData.deposits) || 0)

        // Ensure each client has an ID
        const importedClients = reportData.clients?.map((client) => ({
          ...client,
          id: client.id || crypto.randomUUID(),
        })) || [emptyClient()]

        setReportClients(importedClients)

        // Initialize tabs for imported clients
        const newClientTabs: { [key: string]: string } = {}
        importedClients.forEach((client) => {
          newClientTabs[client.id] = "basic"
        })
        setClientTabs(newClientTabs)

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
        setAddedToday(Number(data.addedToday) || 0)
        setMonthlyAdded(Number(data.monthlyAdded) || 0)
        setOpenShops(Number(data.openShops) || 0)
        setAgentDeposits(Number(data.deposits) || 0)

        const loadedClients = data.clients || [emptyClient()]
        setReportClients(loadedClients)

        // Initialize tabs for loaded clients
        const newClientTabs: { [key: string]: string } = {}
        loadedClients.forEach((client) => {
          newClientTabs[client.id] = "basic"
        })
        setClientTabs(newClientTabs)
      } catch (e) {
        console.error("Error loading saved data:", e)
      }
    } else {
      // Initialize tabs for default client
      const defaultClient = emptyClient()
      setReportClients([defaultClient])
      setClientTabs({ [defaultClient.id]: "basic" })
    }
  }, [])

  // Save data to localStorage when it changes
  useEffect(() => {
    const dataToSave = {
      agentName,
      addedToday,
      monthlyAdded,
      openShops,
      deposits: agentDeposits,
      clients: reportClients,
    }

    localStorage.setItem("agentReportData", JSON.stringify(dataToSave))
  }, [agentName, addedToday, monthlyAdded, openShops, agentDeposits, reportClients])

  // Auto-populate fields when agent is selected
  useEffect(() => {
    if (agentName && agents) {
      const selectedAgent = agents.find((agent) => agent.name === agentName)
      if (selectedAgent) {
        setAddedToday(selectedAgent.addedToday || 0)
        setMonthlyAdded(selectedAgent.monthlyAdded || 0)
        setOpenShops(selectedAgent.openAccounts || 0)
        setAgentDeposits(selectedAgent.totalDeposits || 0)
      }
    }
  }, [agentName, agents])

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
              <Select value={agentName} onValueChange={setAgentName}>
                <SelectTrigger id="agentName" className="w-full">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents && agents.length > 0 ? (
                    agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.name}>
                        {agent.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      No agents available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="addedToday" className="text-sm font-medium">
                Added Today
              </label>
              <Input
                id="addedToday"
                placeholder="Number of clients added today"
                value={addedToday}
                onChange={(e) => setAddedToday(Number(e.target.value))}
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
                onChange={(e) => setMonthlyAdded(Number(e.target.value))}
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
                onChange={(e) => setOpenShops(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="deposits" className="text-sm font-medium">
                Deposits
              </label>
              <Input
                id="deposits"
                placeholder="Total deposits amount"
                value={agentDeposits}
                onChange={(e) => setAgentDeposits(Number(e.target.value))}
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

        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Important</AlertTitle>
          <AlertDescription className="text-amber-700">
            Both the <strong>Basic Information</strong> and <strong>Plan</strong> tabs must be filled out for each
            client. The Plan tab is required for report generation.
          </AlertDescription>
        </Alert>

        {reportClients.map((client, index) => (
          <Card
            key={client.id}
            id={`client-${client.id}`}
            className={`shadow-sm hover:shadow-md transition-shadow duration-300 ${validationErrors[client.id] ? "border-red-300 bg-red-50" : ""}`}
          >
            <CardHeader className="bg-muted/30 pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">Client {index + 1}</CardTitle>
                  {clientHasPlanInfo(client) ? (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
                    >
                      <CheckCircle2 className="h-3 w-3" /> Plan Complete
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1"
                    >
                      <AlertCircle className="h-3 w-3" /> Plan Required
                    </Badge>
                  )}
                </div>
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
              <Tabs
                defaultValue="basic"
                value={clientTabs[client.id] || "basic"}
                onValueChange={(value) => setActiveTab(client.id, value)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger
                    value="basic"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Basic Information
                  </TabsTrigger>
                  <TabsTrigger
                    value="plan"
                    className={`data-[state=active]:bg-primary data-[state=active]:text-primary-foreground ${validationErrors[client.id] ? "bg-red-100 text-red-700 border-red-300" : ""}`}
                  >
                    Plan <span className="text-red-500 ml-1">*</span>
                  </TabsTrigger>
                </TabsList>

                {validationErrors[client.id] && (
                  <div className="mb-4">
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Required fields</AlertTitle>
                      <AlertDescription>
                        Please fill out both the Conversation Summary and Plan for Tomorrow fields.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                <TabsContent value="basic" className="pt-2 space-y-4">
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
                      placeholder="Client Name/ Age/ Job/Location"
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

                  <div className="flex justify-end mt-4">
                    <Button onClick={() => setActiveTab(client.id, "plan")} className="flex items-center gap-2">
                      Next: Plan <span className="text-xs">(Required)</span>
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="plan" className="pt-2 space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor={`conversationSummary-${client.id}`}
                      className="text-sm font-medium flex items-center"
                    >
                      Conversation Summary <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Textarea
                      id={`conversationSummary-${client.id}`}
                      placeholder="Summarize your conversation"
                      value={client.conversationSummary}
                      onChange={(e) => updateClient(client.id, "conversationSummary", e.target.value)}
                      rows={4}
                      className={validationErrors[client.id] ? "border-red-300" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor={`planForTomorrow-${client.id}`} className="text-sm font-medium flex items-center">
                      Plan for Tomorrow <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Textarea
                      id={`planForTomorrow-${client.id}`}
                      placeholder="What's the plan for tomorrow?"
                      value={client.planForTomorrow}
                      onChange={(e) => updateClient(client.id, "planForTomorrow", e.target.value)}
                      rows={4}
                      className={validationErrors[client.id] ? "border-red-300" : ""}
                    />
                  </div>

                  <div className="flex justify-between mt-4">
                    <Button variant="outline" onClick={() => setActiveTab(client.id, "basic")}>
                      Back to Basic Info
                    </Button>

                    {!clientHasPlanInfo(client) && (
                      <Button
                        variant="destructive"
                        className="flex items-center gap-2"
                        onClick={() => {
                          setValidationErrors({ ...validationErrors, [client.id]: true })
                          toast({
                            title: "Required fields",
                            description: "Please fill out both the Conversation Summary and Plan for Tomorrow fields.",
                            variant: "destructive",
                          })
                        }}
                      >
                        <AlertCircle className="h-4 w-4" />
                        Required Fields
                      </Button>
                    )}

                    {clientHasPlanInfo(client) && (
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 bg-green-50 text-green-700 border-green-200"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Plan Complete
                      </Button>
                    )}
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

