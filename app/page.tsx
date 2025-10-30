'use client'
import Security from "./(auth)/_components/Security"
import { UserMenu } from "@/components/user-menu";
import { useSession } from "@/lib/auth-client";

export default function Home() {
  const { data: session } = useSession()
  return (
    <>
      <div className="bg-background">
        {/* Header with User Menu */}
        <header className="border-b border-border bg-card">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary" />
                <h1 className="text-xl font-semibold text-foreground">My Application</h1>
              </div>
              <UserMenu
                name={session?.user?.name || ""}
                email={session?.user?.email || ""}
                imageUrl={session?.user?.image || ""}
              />
            </div>
          </div>
        </header>
        <Security />
      </div>
    </>
  );
}
