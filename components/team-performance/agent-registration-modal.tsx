"use client"

import type React from "react"

import { useState } from "react"
import { useTeamContext } from "@/context/team-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"

interface AgentRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AgentRegistrationModal({ isOpen, onClose }: AgentRegistrationModalProps) {
  const { addAgent } = useTeamContext()
  const { toast } = useToast()

  const [nameError, setNameError] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    addedToday: 0,
    monthlyAdded: 0,
    openAccounts: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    email: "",
    phone: "",
    position: "",
    joinDate: new Date().toISOString().split("T")[0],
    status: "Active" as "Active" | "Inactive",
  })

  const validateName = (value: string) => {
    if (!value.trim()) {
      setNameError("Agent name is required")
      return false
    }
    setNameError("")
    return true
  }

  const handleSubmit = () => {
    if (!validateName(formData.name)) {
      return
    }

    addAgent({
      name: formData.name,
      addedToday: formData.addedToday,
      monthlyAdded: formData.monthlyAdded,
      openAccounts: formData.openAccounts,
      totalDeposits: formData.totalDeposits,
    })

    toast({
      title: "Agent Added",
      description: `${formData.name} has been added successfully`,
    })

    onClose()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]:
        name === "addedToday" ||
        name === "monthlyAdded" ||
        name === "openAccounts" ||
        name === "totalDeposits" ||
        name === "totalWithdrawals"
          ? Number(value)
          : value,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Agent</DialogTitle>
          <DialogDescription>Enter the agent details to add them to the system</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Agent Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={(e) => {
                handleInputChange(e)
                validateName(e.target.value)
              }}
              placeholder="Enter agent name"
              className={nameError ? "border-red-500" : ""}
            />
            {nameError && (
              <div className="text-sm text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {nameError}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="addedToday">Added Today</Label>
              <Input
                id="addedToday"
                name="addedToday"
                type="number"
                min="0"
                value={formData.addedToday}
                onChange={handleInputChange}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyAdded">Monthly Added</Label>
              <Input
                id="monthlyAdded"
                name="monthlyAdded"
                type="number"
                min="0"
                value={formData.monthlyAdded}
                onChange={handleInputChange}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="openAccounts">Open Accounts</Label>
              <Input
                id="openAccounts"
                name="openAccounts"
                type="number"
                min="0"
                value={formData.openAccounts}
                onChange={handleInputChange}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalDeposits">Total Deposits ($)</Label>
              <Input
                id="totalDeposits"
                name="totalDeposits"
                type="number"
                min="0"
                step="0.01"
                value={formData.totalDeposits}
                onChange={handleInputChange}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalWithdrawals">Total Withdrawals ($)</Label>
              <Input
                id="totalWithdrawals"
                name="totalWithdrawals"
                type="number"
                min="0"
                step="0.01"
                value={formData.totalWithdrawals}
                onChange={handleInputChange}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Agent</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

