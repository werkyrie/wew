"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TeamHeroDashboard from "@/components/team-performance/team-hero-dashboard"
import AgentTable from "@/components/team-performance/agent-table"
import PenaltiesTab from "@/components/team-performance/penalties-tab"
import RewardsTab from "@/components/team-performance/rewards-tab"
import AttendanceTab from "@/components/team-performance/attendance-tab"
import { Users, AlertTriangle, Award, Calendar } from "lucide-react"

export default function TeamPerformancePage() {
  const [activeTab, setActiveTab] = useState("overview")
  const { isViewer } = useAuth()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Team Performance</h2>

      <TeamHeroDashboard />

      <Card className="shadow-sm animate-fade-in">
        <CardHeader className="bg-muted/30 rounded-t-lg">
          <CardTitle>Agent Performance Management</CardTitle>
          <CardDescription>Track and manage agent performance metrics</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 p-2 bg-muted/20 rounded-md gap-1 mb-1">
              <TabsTrigger
                value="overview"
                className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all duration-200 flex items-center justify-center gap-2 hover:bg-muted/50 py-2"
              >
                <Users className="h-4 w-4" />
                Agent Overview
              </TabsTrigger>
              <TabsTrigger
                value="penalties"
                className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all duration-200 flex items-center justify-center gap-2 hover:bg-muted/50 py-2"
              >
                <AlertTriangle className="h-4 w-4" />
                Penalties
              </TabsTrigger>
              <TabsTrigger
                value="rewards"
                className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all duration-200 flex items-center justify-center gap-2 hover:bg-muted/50 py-2"
              >
                <Award className="h-4 w-4" />
                Rewards
              </TabsTrigger>
              <TabsTrigger
                value="attendance"
                className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all duration-200 flex items-center justify-center gap-2 hover:bg-muted/50 py-2"
              >
                <Calendar className="h-4 w-4" />
                Attendance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="p-4 animate-in fade-in duration-300">
              <AgentTable />
            </TabsContent>

            <TabsContent value="penalties" className="p-4 animate-in fade-in duration-300">
              <PenaltiesTab />
            </TabsContent>

            <TabsContent value="rewards" className="p-4 animate-in fade-in duration-300">
              <RewardsTab />
            </TabsContent>

            <TabsContent value="attendance" className="p-4 animate-in fade-in duration-300">
              <AttendanceTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

