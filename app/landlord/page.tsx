"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export default function LandlordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Landlord Portal
            </h1>
            <p className="text-muted-foreground">
              Coming soon! Join our waitlist to be notified when we launch.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Join the Waitlist</CardTitle>
              <CardDescription>
                Be the first to know when landlord features are available
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="space-y-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Thanks for joining! We&apos;ll notify you when we launch.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/">Back to Home</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Join Waitlist
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="text-center">
            <Button asChild variant="link">
              <Link href="https://rentlivva.com/" target="_blank" rel="noopener noreferrer">
                Visit rentlivva.com →
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <Button asChild variant="ghost">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

