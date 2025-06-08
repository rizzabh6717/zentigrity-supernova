import { EmergencyReport } from "@/components/emergency-report"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, MapPin, AlertCircle } from "lucide-react"

const emergencyContacts = [
  {
    name: "Police",
    number: "100",
    description: "For immediate police assistance"
  },
  {
    name: "Fire Department",
    number: "101",
    description: "For fire emergencies"
  },
  {
    name: "Ambulance",
    number: "102",
    description: "For medical emergencies"
  },
  {
    name: "Disaster Management",
    number: "108",
    description: "For natural disasters and major incidents"
  }
]

export default function EmergencyPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Emergency Services</h1>
        <p className="text-muted-foreground">
          Report emergencies and access emergency contact information
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <EmergencyReport />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contacts</CardTitle>
              <CardDescription>
                Important emergency contact numbers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {emergencyContacts.map((contact) => (
                <div key={contact.name} className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{contact.name}</h3>
                    <p className="text-muted-foreground">{contact.description}</p>
                    <p className="text-2xl font-bold mt-1">{contact.number}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Guidelines</CardTitle>
              <CardDescription>
                What to do in emergency situations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold">Stay Calm</h3>
                  <p className="text-muted-foreground">
                    Remain calm and assess the situation before taking action.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold">Provide Location</h3>
                  <p className="text-muted-foreground">
                    Always provide your exact location when reporting an emergency.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold">Stay Available</h3>
                  <p className="text-muted-foreground">
                    Keep your phone line open after reporting an emergency.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 