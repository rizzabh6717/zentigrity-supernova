import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, CheckCircle, MapPin, Users } from "lucide-react"
import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-around w-screen">
      {/* Hero Section */}
      <section className="relative w-full min-h-[400px] flex items-center justify-center bg-gradient-to-tr from-blue-100 via-white to-primary/10 overflow-hidden">
  <div className="absolute inset-0 bg-[url('/urban-bg.jpg')] bg-cover bg-center opacity-20 pointer-events-none" />
  <div className="container px-4 md:px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 py-16">
    <div className="flex-1 flex flex-col gap-6 animate-fade-in-up">
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-4">Empowering Communities<br />Through Civic Engagement</h1>
      <p className="text-lg md:text-2xl text-gray-700 max-w-xl mb-6">Report local issues, track resolutions, and participate in community governance. Together, we can build better neighborhoods.</p>
      {/* Animated Search Bar */}
      <div className="flex w-full max-w-md bg-white rounded-full shadow-md p-2 mb-4 animate-fade-in">
        <input type="text" placeholder="Search for services, issues, or locations..." className="flex-1 px-4 py-2 rounded-full outline-none" />
        <button className="bg-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-primary/90 transition-colors">Search</button>
      </div>
      <div className="flex gap-4">
        <Link href="/login">
          <Button size="lg" className="gap-1.5">Get Started<ArrowRight className="h-4 w-4" /></Button>
        </Link>
        <Link href="">
          <Button size="lg" variant="outline">How It Works</Button>
        </Link>
      </div>
    </div>
    <div className="flex-1 flex items-center justify-center animate-fade-in-right">
      <Image src="/landing_image.png" width={500} height={500} alt="Platform Overview" className="rounded-xl shadow-lg object-cover" />
    </div>
  </div>
</section>


      {/* Stats Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted justify-center flex">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Making a Difference</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our platform connects citizens, workers, and local governance to solve community issues efficiently.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center justify-center space-y-2 border rounded-lg p-4 bg-background">
              <div className="text-4xl font-bold">10,000+</div>
              <p className="text-sm text-muted-foreground">Issues Resolved</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 border rounded-lg p-4 bg-background">
              <div className="text-4xl font-bold">5,000+</div>
              <p className="text-sm text-muted-foreground">Active Citizens</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 border rounded-lg p-4 bg-background">
              <div className="text-4xl font-bold">1,200+</div>
              <p className="text-sm text-muted-foreground">Verified Workers</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 border rounded-lg p-4 bg-background">
              <div className="text-4xl font-bold">$2.5M</div>
              <p className="text-sm text-muted-foreground">Community Funds Allocated</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 justify-center flex">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How It Works</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our platform connects citizens, workers, and local governance to solve community issues efficiently.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 bg-background">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Report Issues</h3>
              <p className="text-center text-muted-foreground">
                Citizens report local issues with photos, descriptions, and location data.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 bg-background">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Community Voting</h3>
              <p className="text-center text-muted-foreground">
                Participate in quadratic voting to prioritize issues and allocate resources.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 bg-background">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Transparent Resolution</h3>
              <p className="text-center text-muted-foreground">
                Track progress, verify completion, and rate the quality of work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted justify-center flex">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Join Our Community</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Be part of the solution. Sign up today and help improve your neighborhood.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

