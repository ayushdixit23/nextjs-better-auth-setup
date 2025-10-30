"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Shield, Smartphone, Monitor, Tablet, Check, X, LogOut, Loader2 } from "lucide-react"
import { useSession, signOut, changePassword, listSessions, revokeSession, revokeSessions } from "@/lib/auth-client"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"
import TwoFactorAuth from "./TwoFactorAuth"

export default function Security() {
    const { data: session } = useSession()
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
    const [isSigningOutAll, setIsSigningOutAll] = useState(false)
    const [isEnabling2FA, setIsEnabling2FA] = useState(false)
    const [sessions, setSessions] = useState<any[]>([])
    const [isLoadingSessions, setIsLoadingSessions] = useState(false)
    const [isRevokingSession, setIsRevokingSession] = useState<string | null>(null)
    const router = useRouter()

    // Password validation - matching signup form requirements
    const hasMinLength = newPassword.length >= 8
    const hasUppercase = /[A-Z]/.test(newPassword)
    const hasNumber = /[0-9]/.test(newPassword)
    const passwordsMatch = newPassword === confirmPassword && confirmPassword !== ""
    const isPasswordValid = hasMinLength && hasUppercase && hasNumber && passwordsMatch

    // Load sessions on component mount
    useEffect(() => {
        loadSessions()
    }, [])

    const handleRevokeSession = async (sessionToken: string) => {
        setIsRevokingSession(sessionToken)
        try {
            await revokeSession({
                token: sessionToken
            })

            setSessions(prev => prev.filter(s => s.token !== sessionToken))
            toast.success("Session revoked successfully")
        } catch (error) {
            console.error("Error revoking session:", error)
            toast.error("Failed to revoke session")
        } finally {
            setIsRevokingSession(null)
        }
    }

    const handlePasswordChange = async () => {
        if (!isPasswordValid) {
            toast.error("Please ensure all password requirements are met")
            return
        }

        setIsUpdatingPassword(true)
        try {
            const result = await changePassword({
                currentPassword,
                newPassword,
                revokeOtherSessions: true
            })

            if (result.error) {
                toast.error(result.error.message || "Failed to update password")
            } else {
                toast.success("Password updated successfully!")
                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")
            }
        } catch (error) {
            toast.error("Failed to update password. Please try again.")
        } finally {
            setIsUpdatingPassword(false)
        }
    }

    const handleSignOutAllDevices = async () => {
        setIsSigningOutAll(true)
        try {
            await revokeSessions()
            toast.success("Sessions revoked successfully")
        } catch (error) {
            console.error("Error signing out:", error)
            toast.error("Failed to sign out. Please try again.")
        } finally {
            setIsSigningOutAll(false)
        }
    }

    // Helper function to get device icon and name based on user agent
    const getDeviceInfo = (userAgent: string) => {
        if (!userAgent) return { icon: Monitor, name: 'Unknown Device' }

        // Mobile detection
        if (userAgent.includes('Mobile') || userAgent.includes('Android')) {
            return { icon: Smartphone, name: 'Mobile Device' }
        }

        // Tablet detection
        if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
            return { icon: Tablet, name: 'Tablet' }
        }

        // Desktop browsers
        if (userAgent.includes('Chrome')) return { icon: Monitor, name: 'Chrome Browser' }
        if (userAgent.includes('Firefox')) return { icon: Monitor, name: 'Firefox Browser' }
        if (userAgent.includes('Safari')) return { icon: Monitor, name: 'Safari Browser' }
        if (userAgent.includes('Edge')) return { icon: Monitor, name: 'Edge Browser' }

        return { icon: Monitor, name: 'Desktop Browser' }
    }

    // Helper function to format timestamp
    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp)
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
    }

    // Helper function to get time ago
    const getTimeAgo = (timestamp: string) => {
        const now = new Date()
        const sessionTime = new Date(timestamp)
        const diffInMinutes = Math.floor((now.getTime() - sessionTime.getTime()) / (1000 * 60))

        if (diffInMinutes < 1) return 'Just now'
        if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
        return `${Math.floor(diffInMinutes / 1440)} days ago`
    }

    const loadSessions = async () => {
        setIsLoadingSessions(true)
        try {
            const { data, error } = await listSessions()
            if (error) {
                toast.error("Failed to load sessions")
            } else {
                setSessions(data || [])
            }
        } catch (error) {
            console.error("Error loading sessions:", error)
            toast.error("Failed to load sessions")
        } finally {
            setIsLoadingSessions(false)
        }
    }
    return (
        <div className="space-y-6 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="grid gap-6 lg:col-span-2">
                {/* Password Management */}
                <div className="rounded-lg border border-[#e5e7eb] bg-white p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-[#111827]">Password Management</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="current-password" className="text-sm font-medium text-[#374151]">
                                Current Password
                            </Label>
                            <div className="relative mt-1.5">
                                <Input
                                    id="current-password"
                                    type={showCurrentPassword ? "text" : "password"}
                                    className="pr-10"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280]"
                                >
                                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="new-password" className="text-sm font-medium text-[#374151]">
                                New Password
                            </Label>
                            <div className="relative mt-1.5">
                                <Input
                                    id="new-password"
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280]"
                                >
                                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {newPassword && (
                                <div className="mt-2 space-y-1 text-sm">
                                    <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-[#16a34a]" : "text-[#6b7280]"}`}>
                                        {hasMinLength ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                                        At least 8 characters
                                    </div>
                                    <div className={`flex items-center gap-1.5 ${hasUppercase ? "text-[#16a34a]" : "text-[#6b7280]"}`}>
                                        {hasUppercase ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                                        Contains uppercase letter
                                    </div>
                                    <div className={`flex items-center gap-1.5 ${hasNumber ? "text-[#16a34a]" : "text-[#6b7280]"}`}>
                                        {hasNumber ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                                        Contains number
                                    </div>
                                    {confirmPassword && (
                                        <div className={`flex items-center gap-1.5 ${passwordsMatch ? "text-[#16a34a]" : "text-[#dc2626]"}`}>
                                            {passwordsMatch ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                                            Passwords match
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="confirm-password" className="text-sm font-medium text-[#374151]">
                                Confirm New Password
                            </Label>
                            <div className="relative mt-1.5">
                                <Input
                                    id="confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    className="pr-10"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280]"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                className="bg-[#0f766e] hover:bg-[#0f766e]/90"
                                onClick={handlePasswordChange}
                                disabled={!isPasswordValid || isUpdatingPassword}
                            >
                                {isUpdatingPassword ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Shield className="mr-2 h-4 w-4" />
                                )}
                                {isUpdatingPassword ? "Updating..." : "Update Password"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setCurrentPassword("")
                                    setNewPassword("")
                                    setConfirmPassword("")
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
                {/* Login Activity */}
                <div className="rounded-lg border border-[#e5e7eb] bg-white p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-[#111827]">Active Sessions & Login History</h2>
                        <button
                            className="text-sm font-medium text-[#0f766e] hover:text-[#0f766e]/80"
                            onClick={loadSessions}
                        >
                            Refresh
                        </button>
                    </div>

                    {isLoadingSessions ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-[#6b7280]" />
                            <span className="ml-2 text-sm text-[#6b7280]">Loading sessions...</span>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sessions.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-sm text-[#6b7280]">No sessions found</p>
                                </div>
                            ) : (
                                sessions.map((sessionItem, index) => {
                                    const deviceInfo = getDeviceInfo(sessionItem.userAgent || '')
                                    const Icon = deviceInfo.icon
                                    // Check if this session is the current one by comparing with the current session token
                                    const isCurrentSession = sessionItem.token === session?.session?.token

                                    return (
                                        <div
                                            key={sessionItem.id || index}
                                            className={`flex items-center justify-between rounded-lg border p-4 ${isCurrentSession
                                                    ? "border-[#dcfce7] bg-[#f0fdf4]"
                                                    : "border-[#e5e7eb] bg-white"
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f3f4f6]">
                                                    <Icon className="h-5 w-5 text-[#6b7280]" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-[#111827]">
                                                        {deviceInfo.name}
                                                    </h4>
                                                    <p className="text-xs text-[#6b7280]">
                                                        IP: {sessionItem.ipAddress || 'Unknown IP'} • {sessionItem.userAgent?.includes('Mobile') ? 'Mobile Device' : 'Desktop'}
                                                    </p>
                                                    <p className="text-xs text-[#9ca3af]">
                                                        {formatTimestamp(sessionItem.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-right">
                                                    {isCurrentSession ? (
                                                        <>
                                                            <div className="inline-flex items-center rounded-md bg-[#dcfce7] px-2 py-1 text-xs font-medium text-[#166534]">
                                                                Current Session
                                                            </div>
                                                            <p className="mt-1 text-xs text-[#16a34a]">Active now</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="inline-flex items-center rounded-md bg-[#f3f4f6] px-2 py-1 text-xs font-medium text-[#6b7280]">
                                                                Inactive
                                                            </div>
                                                            <p className="mt-1 text-xs text-[#9ca3af]">
                                                                {getTimeAgo(sessionItem.updatedAt || sessionItem.createdAt)}
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                                {!isCurrentSession && (
                                                    <div className="flex gap-1">
                                                        {(() => {
                                                            const disabled = isRevokingSession === sessionItem.token
                                                            return (
                                                                <div
                                                                    role="button"
                                                                    onClick={!disabled ? () => handleRevokeSession(sessionItem.token) : undefined}
                                                                    aria-disabled={disabled}
                                                                    className={`inline-flex h-8 cursor-pointer items-center justify-center rounded-md border px-2 text-xs border-red-200 text-red-600 hover:bg-red-50 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
                                                                >
                                                                    {disabled ? (
                                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                                    ) : (
                                                                        'Revoke'
                                                                    )}
                                                                </div>
                                                            )
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    )}

                    {sessions.length > 0 && (
                        <Button
                            variant="outline"
                            className="mt-6 w-full border-[#fca5a5] text-[#dc2626] hover:bg-[#fee2e2] bg-transparent"
                            onClick={handleSignOutAllDevices}
                            disabled={isSigningOutAll}
                        >
                            {isSigningOutAll ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <LogOut className="mr-2 h-4 w-4" />
                            )}
                            {isSigningOutAll ? "Signing Out..." : "Sign Out All Other Devices"}
                        </Button>
                    )}
                </div>
            </div>

            <TwoFactorAuth user={session?.user} />
        </div>
    )
}
