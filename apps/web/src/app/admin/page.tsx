"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Users, MessageSquare, Shield, Server, 
  Trash2, Ban, CheckCircle, AlertTriangle,
  Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import axios from "axios"

interface DashboardStats {
  totalSessions: number
  activeSessions: number
  onlineNow: number
  totalRooms: number
  activeRooms: number
  totalMessages: number
  pendingReports: number
}

interface Room {
  id: string
  name: string
  code: string
  participants: string[]
  isActive: boolean
  createdAt: string
}

interface Report {
  id: string
  reporterId: string
  reportedId: string
  roomId: string
  reason: string
  status: string
  createdAt: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [adminToken, setAdminToken] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    fetchData()
  }, [isAuthenticated])

  const fetchData = async () => {
    try {
      axios.defaults.headers.common["x-admin-token"] = adminToken
      const [statsRes, roomsRes, reportsRes] = await Promise.all([
        axios.get("/api/v1/admin/stats"),
        axios.get("/api/v1/admin/rooms"),
        axios.get("/api/v1/admin/reports"),
      ])
      setStats(statsRes.data.data)
      setRooms(roomsRes.data.data.rooms)
      setReports(reportsRes.data.data.reports)
    } catch (error) {
      console.error("Failed to fetch admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteRoom = async (roomId: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return
    await axios.delete(`/api/v1/admin/rooms/${roomId}`)
    setRooms((prev) => prev.filter((r) => r.id !== roomId))
  }

  const resolveReport = async (reportId: string, action: string) => {
    await axios.patch(`/api/v1/admin/reports/${reportId}`, { action })
    setReports((prev) => prev.filter((r) => r.id !== reportId))
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md space-y-4 p-6">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-primary mb-4" />
            <h1 className="text-2xl font-bold">Admin Access</h1>
            <p className="text-muted-foreground">Enter admin token to continue</p>
          </div>
          <Input
            type="password"
            placeholder="Admin token"
            value={adminToken}
            onChange={(e) => setAdminToken(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setIsAuthenticated(true)}
          />
          <Button onClick={() => setIsAuthenticated(true)} className="w-full">
            Access Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor and manage your Mingling instance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { label: "Total Sessions", value: stats?.totalSessions || 0, icon: Users, color: "text-blue-500" },
          { label: "Online Now", value: stats?.onlineNow || 0, icon: Activity, color: "text-green-500" },
          { label: "Active Rooms", value: stats?.activeRooms || 0, icon: MessageSquare, color: "text-purple-500" },
          { label: "Pending Reports", value: stats?.pendingReports || 0, icon: AlertTriangle, color: "text-red-500" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border bg-card">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold">Rooms</h2>
            <Input
              placeholder="Search rooms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 h-8"
            />
          </div>
          <div className="divide-y">
            {rooms
              .filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
              .map((room) => (
                <div key={room.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                  <div>
                    <p className="font-medium">{room.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {room.code} • {room.participants?.length || 0} participants
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteRoom(room.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Pending Reports</h2>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {reports.map((report) => (
              <div key={report.id} className="p-4 hover:bg-muted/50 space-y-2">
                <p className="text-sm font-medium">{report.reason}</p>
                <p className="text-xs text-muted-foreground">
                  Reported: {report.reportedId} • Room: {report.roomId}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolveReport(report.id, "dismiss")}
                  >
                    <CheckCircle className="mr-1 h-3 w-3" /> Dismiss
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => resolveReport(report.id, "block")}
                  >
                    <Ban className="mr-1 h-3 w-3" /> Block User
                  </Button>
                </div>
              </div>
            ))}
            {reports.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No pending reports
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}