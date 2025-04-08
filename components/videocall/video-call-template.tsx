"use client"

import { DialogFooter } from "@/components/ui/dialog"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { jsPDF } from "jspdf"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  User,
  MapPin,
  Briefcase,
  Heart,
  PawPrintIcon as Paw,
  Users,
  CloudSun,
  Calendar,
  Globe,
  Car,
  UserIcon as UserTie,
  Tag,
  Clock,
  BabyIcon as Child,
  Edit,
  Info,
  FileText,
  Download,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"

interface FormData {
  // Model Details
  purpose: string
  fullName: string
  location: string
  previousLocation: string
  work: string
  divorce: string
  pet: string
  kids: string
  weather: string
  parents: string
  plans: string
  ethnicity: string
  car: string

  // Client Details
  clientName: string
  clientLocation: string
  clientWork: string
  hobbies: string
  clientkid: string
  clientnickname: string
  clientweekend: string
  clientweather: string

  // Topics
  beforeCall: string
  afterCall: string
  kidLocation: string
  remarks: string
}

const initialFormData: FormData = {
  // Model Details
  purpose: "",
  fullName: "",
  location: "",
  previousLocation: "",
  work: "",
  divorce: "",
  pet: "",
  kids: "",
  weather: "",
  parents: "",
  plans: "",
  ethnicity: "",
  car: "",

  // Client Details
  clientName: "",
  clientLocation: "",
  clientWork: "",
  hobbies: "",
  clientkid: "",
  clientnickname: "",
  clientweekend: "",
  clientweather: "",

  // Topics
  beforeCall: "",
  afterCall: "",
  kidLocation: "",
  remarks: "",
}

const requiredFields = [
  "purpose",
  "fullName",
  "location",
  "work",
  "kids",
  "weather",
  "parents",
  "plans",
  "clientName",
  "clientLocation",
  "clientWork",
  "clientnickname",
  "clientweekend",
  "clientweather",
  "beforeCall",
  "afterCall",
  "kidLocation",
]

export default function VideoCallTemplate() {
  const [formData, setFormData] = useState<FormData>(() => {
    // Load from localStorage if available
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem("videoCallFormData")
      return savedData ? JSON.parse(savedData) : initialFormData
    }
    return initialFormData
  })

  const [activeTab, setActiveTab] = useState("model")
  const [progress, setProgress] = useState(0)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const pdfRef = useRef<HTMLIFrameElement>(null)

  const { theme } = useTheme()
  const isDarkMode = theme === "dark"

  // Update progress when form data changes
  useEffect(() => {
    const filledRequiredFields = requiredFields.filter((field) => formData[field as keyof FormData]?.trim() !== "")
    const newProgress = Math.round((filledRequiredFields.length / requiredFields.length) * 100)
    setProgress(newProgress)

    // Save to localStorage
    localStorage.setItem("videoCallFormData", JSON.stringify(formData))
  }, [formData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const isTabComplete = (tab: string) => {
    const tabFields: Record<string, string[]> = {
      model: ["purpose", "fullName", "location", "work", "kids", "weather", "parents", "plans"],
      client: ["clientName", "clientLocation", "clientWork", "clientnickname", "clientweekend", "clientweather"],
      topics: ["beforeCall", "afterCall", "kidLocation"],
    }

    return tabFields[tab].every((field) => formData[field as keyof FormData]?.trim() !== "")
  }

  const isFormValid = () => {
    return requiredFields.every((field) => formData[field as keyof FormData]?.trim() !== "")
  }

  const handleGeneratePdf = () => {
    if (!isFormValid()) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields before generating the PDF.",
        variant: "destructive",
      })

      // Find the first tab with incomplete fields and switch to it
      if (!isTabComplete("model")) {
        setActiveTab("model")
      } else if (!isTabComplete("client")) {
        setActiveTab("client")
      } else {
        setActiveTab("topics")
      }

      return
    }

    setIsLoading(true)
    setIsDialogOpen(true)

    // Simulate PDF generation delay
    setTimeout(() => {
      generatePDF()
      setIsLoading(false)
    }, 1000)
  }

  // Helper function to truncate text if it's too long
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "N/A"
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  // Replace the generatePDF function with this vertical layout version
  const generatePDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait", // Change to portrait for vertical layout
        unit: "mm",
        format: "a4",
      })

      // Set background color based on theme
      doc.setFillColor(255, 255, 255)
      doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, "F")

      // Page dimensions
      const pageWidth = doc.internal.pageSize.width
      const pageHeight = doc.internal.pageSize.height
      const margin = 10
      const contentWidth = pageWidth - margin * 2

      // Start position
      let yPosition = 10

      // Title
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(0, 0, 0)
      doc.text("VIDEO CALL INFORMATION", pageWidth / 2, yPosition, { align: "center" })
      yPosition += 10

      // Section 1: Model Details
      doc.setFillColor(50, 50, 50)
      doc.roundedRect(margin, yPosition, contentWidth, 8, 1, 1, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("MODEL DETAILS", margin + 5, yPosition + 5.5)
      yPosition += 10

      // Model details content background
      doc.setFillColor(245, 245, 245)
      doc.roundedRect(margin, yPosition, contentWidth, 70, 1, 1, "F")

      // Model details content
      let contentY = yPosition + 5
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)

      // Create two columns for model details to save space
      const colWidth = contentWidth / 2
      const leftColX = margin + 5
      const rightColX = margin + colWidth + 5

      // Key model details - left column
      const leftColFields = [
        { label: "Purpose:", value: formData.purpose || "N/A" },
        { label: "Name/Age:", value: formData.fullName || "N/A" },
        { label: "Location:", value: formData.location || "N/A" },
        { label: "Work:", value: formData.work || "N/A" },
        { label: "Kids:", value: formData.kids || "N/A" },
        { label: "Weather:", value: formData.weather || "N/A" },
      ]

      // Key model details - right column
      const rightColFields = [
        { label: "Parents:", value: formData.parents || "N/A" },
        { label: "Plans:", value: formData.plans || "N/A" },
      ]

      // Add optional fields if they have content
      if (formData.previousLocation) rightColFields.push({ label: "Prev. Location:", value: formData.previousLocation })
      if (formData.divorce) rightColFields.push({ label: "Relationship:", value: formData.divorce })
      if (formData.pet) rightColFields.push({ label: "Pet:", value: formData.pet })
      if (formData.ethnicity) rightColFields.push({ label: "Ethnicity:", value: formData.ethnicity })
      if (formData.car) rightColFields.push({ label: "Vehicle:", value: formData.car })

      // Print left column fields
      leftColFields.forEach((field) => {
        doc.setFont("helvetica", "bold")
        doc.text(field.label, leftColX, contentY)
        doc.setFont("helvetica", "normal")
        doc.text(field.value, leftColX + 35, contentY)
        contentY += 7
      })

      // Reset Y position for right column
      contentY = yPosition + 5

      // Print right column fields
      rightColFields.forEach((field) => {
        doc.setFont("helvetica", "bold")
        doc.text(field.label, rightColX, contentY)
        doc.setFont("helvetica", "normal")
        doc.text(field.value, rightColX + 35, contentY)
        contentY += 7
      })

      // Update Y position to after the model details section
      yPosition += 75

      // Section 2: Client Details
      doc.setFillColor(50, 50, 50)
      doc.roundedRect(margin, yPosition, contentWidth, 8, 1, 1, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("CLIENT DETAILS", margin + 5, yPosition + 5.5)
      yPosition += 10

      // Client details content background
      doc.setFillColor(245, 245, 245)
      doc.roundedRect(margin, yPosition, contentWidth, 55, 1, 1, "F")

      // Client details content
      contentY = yPosition + 5
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)

      // Create two columns for client details
      const leftClientColX = margin + 5
      const rightClientColX = margin + colWidth + 5

      // Left column client fields
      const leftClientFields = [
        { label: "Name/Age:", value: formData.clientName || "N/A" },
        { label: "Location:", value: formData.clientLocation || "N/A" },
        { label: "Work:", value: formData.clientWork || "N/A" },
        { label: "Nickname:", value: formData.clientnickname || "N/A" },
      ]

      // Right column client fields
      const rightClientFields = [
        { label: "Weekend:", value: formData.clientweekend || "N/A" },
        { label: "Weather:", value: formData.clientweather || "N/A" },
      ]

      // Add optional fields if they have content
      if (formData.hobbies) rightClientFields.push({ label: "Hobbies:", value: formData.hobbies })
      if (formData.clientkid) rightClientFields.push({ label: "Kids:", value: formData.clientkid })

      // Print left column client fields
      leftClientFields.forEach((field) => {
        doc.setFont("helvetica", "bold")
        doc.text(field.label, leftClientColX, contentY)
        doc.setFont("helvetica", "normal")
        doc.text(field.value, leftClientColX + 35, contentY)
        contentY += 7
      })

      // Reset Y position for right column
      contentY = yPosition + 5

      // Print right column client fields
      rightClientFields.forEach((field) => {
        doc.setFont("helvetica", "bold")
        doc.text(field.label, rightClientColX, contentY)
        doc.setFont("helvetica", "normal")
        doc.text(field.value, rightClientColX + 35, contentY)
        contentY += 7
      })

      // Update Y position to after the client details section
      yPosition += 60

      // Section 3: Topics
      doc.setFillColor(50, 50, 50)
      doc.roundedRect(margin, yPosition, contentWidth, 8, 1, 1, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("TOPICS TO DISCUSS", margin + 5, yPosition + 5.5)
      yPosition += 10

      // Topics content background
      doc.setFillColor(245, 245, 245)
      doc.roundedRect(margin, yPosition, contentWidth, 70, 1, 1, "F")

      // Topics content
      contentY = yPosition + 5
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)

      // Helper function for wrapping text
      const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
        if (!text || text === "N/A") {
          doc.text("N/A", x, y)
          return y + lineHeight
        }

        const lines = doc.splitTextToSize(text, maxWidth - x)
        doc.text(lines, x, y)
        return y + lines.length * lineHeight
      }

      // Before call
      doc.setFont("helvetica", "bold")
      doc.text("Before Call:", margin + 5, contentY)
      doc.setFont("helvetica", "normal")
      contentY = wrapText(formData.beforeCall || "N/A", margin + 40, contentY, contentWidth, 5)
      contentY += 2

      // After call
      doc.setFont("helvetica", "bold")
      doc.text("After Call:", margin + 5, contentY)
      doc.setFont("helvetica", "normal")
      contentY = wrapText(formData.afterCall || "N/A", margin + 40, contentY, contentWidth, 5)
      contentY += 2

      // Kid location
      doc.setFont("helvetica", "bold")
      doc.text("Child Location:", margin + 5, contentY)
      doc.setFont("helvetica", "normal")
      contentY = wrapText(formData.kidLocation || "N/A", margin + 40, contentY, contentWidth, 5)
      contentY += 2

      // Remarks (if any)
      if (formData.remarks && formData.remarks.trim() !== "") {
        doc.setFont("helvetica", "bold")
        doc.text("Additional Topics:", margin + 5, contentY)
        doc.setFont("helvetica", "normal")
        wrapText(formData.remarks, margin + 40, contentY, contentWidth, 5)
      }

      // Footer with timestamp
      const timestamp = new Date().toLocaleString()
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text(`Generated: ${timestamp}`, pageWidth - margin - 2, pageHeight - margin, { align: "right" })

      // Convert to data URL for preview
      const pdfDataUrl = doc.output("datauristring")
      setPdfUrl(pdfDataUrl)
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error generating PDF",
        description: "There was a problem creating your PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDownloadPdf = () => {
    if (!pdfUrl) return

    // Create a link element
    const link = document.createElement("a")
    link.href = pdfUrl

    // Use client name for the filename if available, otherwise use a timestamp
    const clientName = formData.clientName.split("/")[0].trim() || "Client"
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    link.download = `${clientName}_VideoCall_${timestamp}.pdf`

    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "PDF Downloaded",
      description: "Your video call information has been downloaded successfully.",
    })
  }

  const handleReset = () => {
    if (confirm("Are you sure you want to reset the form? All data will be lost.")) {
      setFormData(initialFormData)
      localStorage.removeItem("videoCallFormData")
      setPdfUrl(null)
      setActiveTab("model")
      toast({
        title: "Form Reset",
        description: "All form data has been cleared.",
      })
    }
  }

  const renderFormField = (
    name: keyof FormData,
    label: string,
    icon: React.ReactNode,
    required = false,
    placeholder = "",
    helpText = "",
    tooltip = "",
  ) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center">
          <label htmlFor={name} className="text-sm font-medium flex items-center gap-1">
            {label}
            {required && (
              <Badge variant="destructive" className="text-[10px] py-0">
                Required
              </Badge>
            )}
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help ml-1" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </label>
        </div>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>
          <Input
            id={name}
            name={name}
            value={formData[name]}
            onChange={handleInputChange}
            className="pl-10"
            placeholder={placeholder}
            required={required}
          />
          {formData[name] && (
            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
          )}
        </div>
        {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Card className="border shadow-md dark:bg-gray-900 dark:border-gray-800">
        <CardHeader className="pb-4 dark:text-gray-100">
          <CardTitle className="text-2xl font-bold text-center">Video Call Information</CardTitle>
          <CardDescription className="text-center dark:text-gray-300">
            Fill out the details for your upcoming video call
          </CardDescription>
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className={progress >= 0 ? "font-medium" : ""}>Start</span>
              <span className={progress >= 33 ? "font-medium" : ""}>Model Details</span>
              <span className={progress >= 66 ? "font-medium" : ""}>Client Details</span>
              <span className={progress >= 100 ? "font-medium" : ""}>Complete</span>
            </div>
            <Progress value={progress} className="h-2 dark:bg-gray-800" />
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6 dark:bg-gray-800">
              <TabsTrigger value="model" className="relative">
                Model Details
                {isTabComplete("model") && (
                  <span className="absolute -top-1 -right-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="client" className="relative">
                Client Details
                {isTabComplete("client") && (
                  <span className="absolute -top-1 -right-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="topics" className="relative">
                Topics
                {isTabComplete("topics") && (
                  <span className="absolute -top-1 -right-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="model" className="space-y-6 animate-in fade-in-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFormField(
                  "purpose",
                  "Purpose of Call",
                  <Info className="h-4 w-4" />,
                  true,
                  "E.g., Authenticity",
                )}
                {renderFormField(
                  "fullName",
                  "Full Name and Age",
                  <User className="h-4 w-4" />,
                  true,
                  "E.g., Jane Smith / 30",
                  "Format: Name / Age",
                )}
                {renderFormField(
                  "location",
                  "Current Location",
                  <MapPin className="h-4 w-4" />,
                  true,
                  "E.g., Makati (5 years)",
                  "",
                  "Include city/area and how many years you've lived there",
                )}
                {renderFormField(
                  "previousLocation",
                  "Previous Location",
                  <MapPin className="h-4 w-4" />,
                  false,
                  "E.g., Manila",
                )}
                {renderFormField(
                  "work",
                  "Occupation",
                  <Briefcase className="h-4 w-4" />,
                  true,
                  "E.g., Executive Assistant",
                )}
                {renderFormField(
                  "divorce",
                  "Relationship Status",
                  <Heart className="h-4 w-4" />,
                  false,
                  "E.g., Separated since 2022 (2 years)",
                  "If applicable, include when and for how long",
                )}
                {renderFormField(
                  "pet",
                  "Pet Details",
                  <Paw className="h-4 w-4" />,
                  false,
                  "E.g., Dog / Max / 3 years old",
                  "Type, name, age (or 'None' if not applicable)",
                )}
                {renderFormField(
                  "kids",
                  "Children Details",
                  <Child className="h-4 w-4" />,
                  true,
                  "E.g., Sofia / 8 / ABC School / Grade 3",
                  "Names, ages, schools, grades (or 'NA' if not applicable)",
                )}
                {renderFormField(
                  "weather",
                  "Current Weather & Time",
                  <CloudSun className="h-4 w-4" />,
                  true,
                  "E.g., Sunny, 3:45 PM",
                )}
                {renderFormField(
                  "parents",
                  "Parents Details",
                  <Users className="h-4 w-4" />,
                  true,
                  "E.g., Mother (62, retired), Father (deceased)",
                  "Just put N/A if not mentioned",
                )}
                {renderFormField(
                  "plans",
                  "Weekend Plans",
                  <Calendar className="h-4 w-4" />,
                  true,
                  "E.g., Beach trip with friends",
                )}
                {renderFormField(
                  "ethnicity",
                  "Ethnicity",
                  <Globe className="h-4 w-4" />,
                  false,
                  "E.g., Filipina Taiwanese",
                )}
                {renderFormField(
                  "car",
                  "Vehicle Details",
                  <Car className="h-4 w-4" />,
                  false,
                  "E.g., Toyota Corolla 2020",
                  "Make, model, year (or 'None' if not applicable)",
                  "Make, model, year (or 'None' if not applicable)",
                )}
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setActiveTab("client")} disabled={!isTabComplete("model")}>
                  Next: Client Details
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="client" className="space-y-6 animate-in fade-in-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFormField(
                  "clientName",
                  "Full Name and Age",
                  <UserTie className="h-4 w-4" />,
                  true,
                  "E.g., John Doe / 32",
                )}
                {renderFormField("clientLocation", "Location", <MapPin className="h-4 w-4" />, true, "E.g., New York")}
                {renderFormField(
                  "clientWork",
                  "Occupation",
                  <Briefcase className="h-4 w-4" />,
                  true,
                  "E.g., Marketing Manager",
                )}
                {renderFormField(
                  "hobbies",
                  "Hobbies",
                  <Calendar className="h-4 w-4" />,
                  false,
                  "E.g., Hiking, Travel",
                  "Enter 'None' if not applicable",
                )}
                {renderFormField(
                  "clientkid",
                  "Children Details",
                  <Child className="h-4 w-4" />,
                  false,
                  "E.g., Lily / 3",
                  "Names and ages (or 'None' if not applicable)",
                )}
                {renderFormField(
                  "clientnickname",
                  "Nickname",
                  <Tag className="h-4 w-4" />,
                  true,
                  "E.g., Johnny",
                  "Enter 'None' if not applicable",
                )}
                {renderFormField(
                  "clientweekend",
                  "Weekend Plans",
                  <Calendar className="h-4 w-4" />,
                  true,
                  "E.g., Fishing trip",
                  "Enter 'None' if not applicable",
                )}
                {renderFormField(
                  "clientweather",
                  "Weather and Time",
                  <CloudSun className="h-4 w-4" />,
                  true,
                  "E.g., Rainy, 10:30 AM",
                  "Based on client's location",
                )}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("model")}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={() => setActiveTab("topics")} disabled={!isTabComplete("client")}>
                  Next: Topics
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="topics" className="space-y-6 animate-in fade-in-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFormField(
                  "beforeCall",
                  "What are you doing before Video Call?",
                  <Clock className="h-4 w-4" />,
                  true,
                  "E.g., Preparing lunch",
                  "",
                  "Activities you were doing just before the video call",
                )}
                {renderFormField(
                  "afterCall",
                  "What will you do after the Call?",
                  <Clock className="h-4 w-4" />,
                  true,
                  "E.g., Going to the mall",
                  "",
                  "What you plan to do after finishing the video call",
                )}
                {renderFormField(
                  "kidLocation",
                  "Where is your child right now, and what is she doing?",
                  <Child className="h-4 w-4" />,
                  true,
                  "E.g., At school",
                  "Asan ung Anak mo at ano ung Ginagawa nya?",
                )}
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="remarks" className="text-sm font-medium">
                    Additional Topics
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-muted-foreground">
                      <Edit className="h-4 w-4" />
                    </div>
                    <Textarea
                      id="remarks"
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      className="pl-10 min-h-[100px]"
                      placeholder="Specific topics you'd like to discuss with your client..."
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Ilagay nyo dito ung gusto nyo I highlight sa Tawag.</p>
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("client")}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleGeneratePdf} disabled={!isFormValid()}>
                  <FileText className="mr-2 h-4 w-4" /> Generate PDF
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" onClick={handleReset}>
            Reset Form
          </Button>
          <div className="text-sm text-muted-foreground">
            {progress === 100 ? (
              <span className="flex items-center text-green-500">
                <CheckCircle className="mr-1 h-4 w-4" /> All required fields completed
              </span>
            ) : (
              <span className="flex items-center">
                <AlertCircle className="mr-1 h-4 w-4" />{" "}
                {requiredFields.length -
                  requiredFields.filter((field) => formData[field as keyof FormData]?.trim() !== "").length}{" "}
                required fields remaining
              </span>
            )}
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" /> Video Call Information PDF
            </DialogTitle>
            <DialogDescription>
              Preview your generated PDF. Rename the file with the client's name when downloading.
            </DialogDescription>
          </DialogHeader>

          <div className="relative min-h-[60vh] bg-muted rounded-md overflow-hidden">
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-2"></div>
                <p className="text-sm">Generating your document...</p>
              </div>
            ) : pdfUrl ? (
              <iframe ref={pdfRef} src={pdfUrl} className="w-full h-[60vh]" title="PDF Preview" frameBorder="0" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-muted-foreground">PDF preview will appear here</p>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Edit Information
            </Button>
            <Button onClick={handleDownloadPdf} disabled={!pdfUrl || isLoading}>
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
