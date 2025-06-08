'use client';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, User, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react";

export default function GrievanceDashboardPage() {
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrievances = async () => {
      try {
        // Fetch from backend REST API instead of blockchain
        const response = await fetch('http://localhost:5000/get_all_grievances');
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          // Map backend data to UI format
          const formatted = data.data.map((g: any) => ({
            title: g.title,
            description: g.description,
            category: g.category,
            location: g.location,
            mediaCount: Number(g.mediaCount),
            priorityLevel: g.priorityLevel,
            estimatedDays: Number(g.estimatedDays),
            fundAmount: Number(g.fundAmount || 0),
            currency: g.currency || '',
            aiJustification: g.aiJustification,
            trackingId: g.trackingId,
            timestamp: g.createdAt ? g.createdAt * 1000 : Date.now(),
            submitter: g.submitter,
            resolved: g.resolved,
            status: g.resolved ? "completed" : "pending",
            _id: g.trackingId,
            createdAt: g.createdAt ? new Date(g.createdAt * 1000).toISOString() : undefined,
          }));
          setGrievances(formatted);
        } else {
          setGrievances([]);
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchGrievances();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdating(id);
    await fetch("/api/requests-status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus })
    });
    setUpdating(null);
    fetch("/api/requests")
      .then(res => res.json())
      .then(data => {
        setGrievances(data);
      });
  };

  if (loading) return <div>Loading...</div>;

  // Define which statuses are considered 'active'
  const activeStatuses = ["pending", "in_progress"];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">My Grievances</h1>
        <p className="text-muted-foreground">Track and manage your submitted issues</p>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active ({grievances.filter(g => activeStatuses.includes(g.status)).length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({grievances.filter(g => g.status === "completed").length})</TabsTrigger>
          <TabsTrigger value="all">All Grievances</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4">
          {grievances.filter(g => activeStatuses.includes(g.status)).length === 0 ? (
            <div>No active grievances found.</div>
          ) : (
            grievances.filter(g => activeStatuses.includes(g.status)).map((g) => (
              <Card key={g._id}>
                <CardHeader className="pb-2">
                  <CardTitle>{g.title}</CardTitle>
                  <CardDescription>Submitted {new Date(g.createdAt).toLocaleString()} • ID: {g._id}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge>{g.category}</Badge>
                      <Badge
                        variant="outline"
                        className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-900"
                      >
                        In Progress
                      </Badge>
                    </div>

                    <div className="relative">
                      <div className="absolute left-3 top-0 h-full w-0.5 bg-muted"></div>
                      <ol className="space-y-4">
                        <li className="relative pl-8">
                          <div className="absolute left-0 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Submitted</p>
                            <p className="text-xs text-muted-foreground">{new Date(g.createdAt).toLocaleString()}</p>
                          </div>
                        </li>
                        <li className="relative pl-8">
                          <div className="absolute left-0 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Under Review</p>
                            <p className="text-xs text-muted-foreground">{new Date(g.updatedAt).toLocaleString()}</p>
                          </div>
                        </li>
                        <li className="relative pl-8">
                          <div className="absolute left-0 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Assigned</p>
                            <p className="text-xs text-muted-foreground">{new Date(g.updatedAt).toLocaleString()}</p>
                          </div>
                        </li>
                        <li className="relative pl-8">
                          <div className="absolute left-0 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <Clock className="h-4 w-4" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">In Progress</p>
                            <p className="text-xs text-muted-foreground">Estimated completion: {new Date(g.updatedAt).toLocaleString()}</p>
                          </div>
                        </li>
                        <li className="relative pl-8">
                          <div className="absolute left-0 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Completed</p>
                            <p className="text-xs text-muted-foreground">Pending</p>
                          </div>
                        </li>
                      </ol>
                    </div>

                    <div className="rounded-lg border p-4">
                      <h4 className="mb-2 text-sm font-medium">Worker Details</h4>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">John Contractor</p>
                          <p className="text-xs text-muted-foreground">Road Repair Specialist • 4.8/5 Rating</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <h4 className="mb-2 text-sm font-medium">Funding Allocation</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">Materials</p>
                          <p className="text-xs font-medium">$350</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">Labor</p>
                          <p className="text-xs font-medium">$450</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">Equipment</p>
                          <p className="text-xs font-medium">$200</p>
                        </div>
                        <div className="h-px bg-border my-2"></div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium">Total</p>
                          <p className="text-xs font-medium">$1,000</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        Add Comment
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive">
                        Escalate Issue
                      </Button>
                      <Button variant="outline" size="sm">
                        View Similar Issues
                      </Button>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <select
                        value={g.status}
                        onChange={e => handleStatusChange(g._id, e.target.value)}
                        disabled={updating === g._id}
                        className="border rounded px-2 py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      {updating === g._id && <span className="text-xs text-muted-foreground">Updating...</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        <TabsContent value="resolved" className="space-y-4">
          {grievances.filter(g => g.status === "completed").length === 0 ? (
            <div>No resolved grievances found.</div>
          ) : (
            grievances.filter(g => g.status === "completed").map((g) => (
              <Card key={g._id}>
                <CardHeader>
                  <CardTitle>{g.title}</CardTitle>
                  <CardDescription>{g.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <div>Status: <Badge>{g.status}</Badge></div>
                    <div>Category: {g.category || '-'}</div>
                    <div>Created At: {g.createdAt ? new Date(g.createdAt).toLocaleString() : '-'}</div>
                    <div>Updated At: {g.updatedAt ? new Date(g.updatedAt).toLocaleString() : '-'}</div>
                    {g.images && g.images.length > 0 && (
                      <div className="flex gap-2 flex-wrap mt-2">
                        {g.images.map((img: string, idx: number) => (
                          <img key={idx} src={img} alt="Grievance Media" className="w-24 h-24 object-cover rounded border" />
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <select
                        value={g.status}
                        onChange={e => handleStatusChange(g._id, e.target.value)}
                        disabled={updating === g._id}
                        className="border rounded px-2 py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      {updating === g._id && <span className="text-xs text-muted-foreground">Updating...</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        <TabsContent value="all" className="space-y-4">
          {grievances.length === 0 ? (
            <div>No grievances found.</div>
          ) : (
            grievances.map((g) => (
              <Card key={g._id}>
                <CardHeader>
                  <CardTitle>{g.title}</CardTitle>
                  <CardDescription>{g.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <div>Status: <Badge>{g.status}</Badge></div>
                    <div>Category: {g.category || '-'}</div>
                    <div>Created At: {g.createdAt ? new Date(g.createdAt).toLocaleString() : '-'}</div>
                    <div>Updated At: {g.updatedAt ? new Date(g.updatedAt).toLocaleString() : '-'}</div>
                    {g.images && g.images.length > 0 && (
                      <div className="flex gap-2 flex-wrap mt-2">
                        {g.images.map((img: string, idx: number) => (
                          <img key={idx} src={img} alt="Grievance Media" className="w-24 h-24 object-cover rounded border" />
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <select
                        value={g.status}
                        onChange={e => handleStatusChange(g._id, e.target.value)}
                        disabled={updating === g._id}
                        className="border rounded px-2 py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      {updating === g._id && <span className="text-xs text-muted-foreground">Updating...</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
