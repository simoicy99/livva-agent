"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Welcome to Livva
            </h1>
            <p className="text-lg text-muted-foreground">
              Your smart rental assistant
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>I&apos;m a Tenant</CardTitle>
                <CardDescription>
                  Find your perfect rental with AI-powered search
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <Button asChild className="w-full" size="lg">
                  <Link href="/tenant">Get Started</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>I&apos;m a Landlord</CardTitle>
                <CardDescription>
                  List and manage your properties
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <Button asChild className="w-full" size="lg" variant="outline">
                  <Link href="/landlord">Coming Soon</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
