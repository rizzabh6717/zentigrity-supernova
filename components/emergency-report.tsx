"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, MapPin, Phone, ShieldAlert, Bell } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type EmergencyType = "medical" | "fire" | "police" | "natural_disaster" | "other"

export function EmergencyReport() {
  const [type, setType] = useState<EmergencyType>("medical")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [phone, setPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default")
  const { toast } = useToast()

  useEffect(() => {
    // Check notification permission on component mount
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission)
    }
  }, [])

  const requestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      return permission
    }
    return "denied"
  }

  const showNotification = async (title: string, options: NotificationOptions) => {
    if (notificationPermission === "granted") {
      new Notification(title, options)
    } else if (notificationPermission === "default") {
      const permission = await requestNotificationPermission()
      if (permission === "granted") {
        new Notification(title, options)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/emergency", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          location,
          description,
          phone,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) throw new Error("Failed to submit emergency report")

      // Show desktop notification
      await showNotification("Emergency Reported", {
        body: `Emergency type: ${type}\nLocation: ${location}`,
        icon: "/emergency-icon.png",
        badge: "/emergency-badge.png",
        tag: "emergency-report",
        requireInteraction: true,
      })

      // Show toast notification
      toast({
        title: "Emergency Reported",
        description: "Your emergency has been reported and help is on the way.",
        variant: "destructive",
      })

      // Reset form
      setType("medical")
      setLocation("")
      setDescription("")
      setPhone("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit emergency report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-red-500" />
          Emergency Report
        </CardTitle>
        <CardDescription>
          Please provide details about the emergency situation. This will be immediately sent to emergency services.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Emergency</AlertTitle>
            <AlertDescription>
              This form is for emergency situations only. Misuse may result in penalties.
            </AlertDescription>
          </Alert>

          {notificationPermission !== "granted" && (
            <Alert>
              <Bell className="h-4 w-4" />
              <AlertTitle>Enable Notifications</AlertTitle>
              <AlertDescription>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={requestNotificationPermission}
                  className="mt-2"
                >
                  Enable Desktop Notifications
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Emergency Type</label>
            <Select value={type} onValueChange={(value: EmergencyType) => setType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select emergency type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="medical">Medical Emergency</SelectItem>
                <SelectItem value="fire">Fire Emergency</SelectItem>
                <SelectItem value="police">Police Emergency</SelectItem>
                <SelectItem value="natural_disaster">Natural Disaster</SelectItem>
                <SelectItem value="other">Other Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Enter location or use current location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Contact Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                type="tel"
                placeholder="Your contact number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Please describe the emergency situation in detail"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Emergency Report"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 