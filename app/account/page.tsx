"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { StoreHeader } from "@/components/store-header"
import { StoreFooter } from "@/components/store-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { fetchProfile, checkIsAdmin } from "@/lib/queries"
import { LogOut, Settings, ShoppingBag } from "lucide-react"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/lib/types"

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push("/auth/login")
        return
      }

      setUser(data.user)
      
      const [profileData, adminStatus] = await Promise.all([
        fetchProfile(data.user.id),
        checkIsAdmin(data.user.id),
      ])
      
      setProfile(profileData)
      setIsAdmin(adminStatus)
      setLoading(false)
    }

    loadUser()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <StoreHeader />
        <main className="flex-1">
          <div className="mx-auto max-w-2xl px-4 py-8">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="mt-8 h-64 w-full" />
          </div>
        </main>
        <StoreFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader />

      <main className="flex-1">
        <div className="border-b border-border bg-secondary/30 py-12">
          <div className="mx-auto max-w-2xl px-4">
            <h1 className="font-serif text-3xl font-bold">My Account</h1>
            <p className="mt-2 text-muted-foreground">
              Welcome back, {profile?.full_name || user?.email}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-2xl px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              {profile?.full_name && (
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">
                    {profile.full_name}
                  </p>
                </div>
              )}
              {profile?.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{profile.phone}</p>
                </div>
              )}
              {profile?.address && (
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{profile.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Link href="/orders">
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">My Orders</p>
                    <p className="text-sm text-muted-foreground">View order history</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {isAdmin && (
              <Link href="/admin">
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                      <Settings className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium">Admin Dashboard</p>
                      <p className="text-sm text-muted-foreground">Manage your store</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>

          <Button
            variant="outline"
            className="mt-8 w-full gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </main>

      <StoreFooter />
    </div>
  )
}
