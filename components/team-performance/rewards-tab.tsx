"use client"

import { useState } from "react"
import { useTeamContext } from "@/context/team-context"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Trash2, CalendarIcon, FileDown, PlusCircle, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import DataResetModal from "@/components/modals/data-reset-modal"

export default function RewardsTab() {
  const { agents, rewards: existingRewards, addReward, deleteReward } = useTeamContext()
  const { isViewer, isAdmin } = useAuth() // Get viewer and admin status
  const { toast } = useToast()

  const [selectedAgentId, setSelectedAgentId] = useState("")
  const [description, setDescription] = useState("")
  const [rewardAmount, setRewards] = useState("")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [status, setStatus] = useState<"Received" | "Pending" | "Cancelled">("Pending")
  const [showForm, setShowForm] = useState(false)

  // Add state for data reset modal
  const [showResetModal, setShowResetModal] = useState(false)

  const handleAddReward = async () => {
    if (!selectedAgentId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select an agent",
      })
      return
    }

    if (!description.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a description",
      })
      return
    }

    if (!rewardAmount.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a reward value",
      })
      return
    }

    const selectedAgent = agents.find((a) => a.id === selectedAgentId)
    if (!selectedAgent) return

    const formattedDate = date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")

    try {
      await addReward({
        agentId: selectedAgentId,
        agentName: selectedAgent.name,
        description,
        amount: rewardAmount,
        date: formattedDate,
        status,
      })

      // Reset form
      setSelectedAgentId("")
      setDescription("")
      setRewards("")
      setDate(new Date())
      setStatus("Pending")
      setShowForm(false)

      toast({
        title: "Reward Added",
        description: `Reward has been recorded for ${selectedAgent.name}`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message || "Failed to add reward",
      })
    }
  }

  const handleDeleteReward = (id: string, agentName: string) => {
    if (confirm(`Are you sure you want to delete this reward for ${agentName}?`)) {
      deleteReward(id)
      toast({
        title: "Reward Deleted",
        description: `Reward for ${agentName} has been removed`,
      })
    }
  }

  // Handle data reset
  const handleDataReset = (resetDate: Date, options: { today: boolean; monthly: boolean; open: boolean }) => {
    try {
      // This would be implemented to call your actual data reset API
      console.log("Resetting data for:", format(resetDate, "yyyy-MM-dd"), options)

      // Show success message
      toast({
        title: "Data Reset Complete",
        description: `Selected data has been reset for ${format(resetDate, "MMMM d, yyyy")}`,
      })

      // Close the modal
      setShowResetModal(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: (error as Error).message || "An error occurred while resetting data",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Received":
        return "bg-green-500"
      case "Pending":
        return "bg-yellow-500"
      case "Cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleExportCsv = () => {
    const headers = ["Date", "Agent", "Description", "Rewards", "Status"]
    const rows = existingRewards.map((reward) => [
      reward.date,
      reward.agentName,
      reward.description,
      reward.amount,
      reward.status,
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => (typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell)).join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "rewards.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export Successful",
      description: "Rewards data has been exported to CSV",
    })
  }

  return (
    <div className="space-y-6">
      {!isViewer && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
            {showForm ? "Cancel" : "Add New Reward"}
            {!showForm && <PlusCircle className="h-4 w-4" />}
          </Button>
        </div>
      )}

      {!isViewer && showForm && (
        <Card className="animate-fade-in shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader>
            <CardTitle>Add New Reward</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agent">Agent</Label>
                <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                  <SelectTrigger id="agent">
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rewards">Rewards</Label>
                <Input
                  id="rewards"
                  type="text"
                  value={rewardAmount}
                  onChange={(e) => setRewards(e.target.value)}
                  placeholder="Enter reward value"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as "Received" | "Pending" | "Cancelled")}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Received">Received</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter reward description"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <Button onClick={handleAddReward} className="w-full">
                  Add Reward
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="animate-fade-in shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Reward Records</CardTitle>
            <div className="flex gap-2">
              {/* Only show Reset Data button for admin users */}
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResetModal(true)}
                  className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:text-amber-800 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-900"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Reset Data
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleExportCsv}>
                <FileDown className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border shadow-sm overflow-x-auto bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-medium">Date</TableHead>
                  <TableHead className="font-medium">Agent</TableHead>
                  <TableHead className="font-medium">Description</TableHead>
                  <TableHead className="font-medium">Rewards</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  {!isViewer && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {existingRewards.length > 0 ? (
                  existingRewards.map((reward) => (
                    <TableRow key={reward.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>{reward.date}</TableCell>
                      <TableCell className="font-medium">{reward.agentName}</TableCell>
                      <TableCell>{reward.description}</TableCell>
                      <TableCell className="font-medium">{reward.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(reward.status)} transition-all`}>{reward.status}</Badge>
                      </TableCell>
                      {!isViewer && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteReward(reward.id, reward.agentName)}
                            className="hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isViewer ? 5 : 6} className="text-center py-8 text-muted-foreground">
                      No rewards recorded
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Data Reset Modal */}
      <DataResetModal isOpen={showResetModal} onClose={() => setShowResetModal(false)} onReset={handleDataReset} />
    </div>
  )
}

