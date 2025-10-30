"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "@/lib/auth-client"
import { Settings, LogOut, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface UserMenuProps {
  name: string
  email: string
  imageUrl?: string
}

function getInitials(fullName: string): string {
  const names = fullName.trim().split(/\s+/)

  if (names.length === 1) {
    return names[0].substring(0, 2).toUpperCase()
  }

  const firstInitial = names[0][0]
  const lastInitial = names[names.length - 1][0]

  return (firstInitial + lastInitial).toUpperCase()
}

export function UserMenu({ name, email, imageUrl }: UserMenuProps) {
  const initials = getInitials(name)
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          aria-busy={isSigningOut}
        >
          <div className="relative">
            <Avatar className="h-10 w-10 cursor-pointer">
              <AvatarImage src={imageUrl || "/placeholder.svg"} alt={name} />
              <AvatarFallback className="bg-primary text-primary-foreground font-medium">{initials}</AvatarFallback>
            </Avatar>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[320px] p-0 select-none" align="end">
        {/* User Info Section */}
        <div className="flex items-center gap-3 p-4 bg-muted/50">
          <Avatar className="h-14 w-14">
            <AvatarImage src={imageUrl || "/placeholder.svg"} alt={name} />
            <AvatarFallback className="bg-primary text-primary-foreground font-medium text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <p className="font-semibold text-foreground truncate">{name}</p>
            <p className="text-sm text-muted-foreground truncate">{email}</p>
          </div>
        </div>

        <DropdownMenuSeparator className="m-0" />

        {/* Menu Items */}
        <div className="p-1">
          <DropdownMenuItem className="cursor-pointer py-3 px-3 select-none">
            <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Manage account</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={async (event) => {
              event.preventDefault()
              if (isSigningOut) return
              setIsSigningOut(true)
              try {
                await signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      router.push("/login")
                    }
                  }
                })
              } finally {
                setIsSigningOut(false)
              }
            }}
            disabled={isSigningOut}
            className={`py-3 px-3 select-none ${isSigningOut ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {isSigningOut ? (
              <>
                <Loader2 className="mr-3 h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm">Signing out...</span>
              </>
            ) : (
              <>
                <LogOut className="mr-3 h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Sign out</span>
              </>
            )}
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="m-0" />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
