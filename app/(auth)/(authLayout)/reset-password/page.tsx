"use client"
import { useState, type FormEvent, useEffect, Suspense } from "react"
import type React from "react"

import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Check, X, Lock, Eye, EyeOff } from "lucide-react"
import { FieldDescription } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { AuthFormHeader } from "../../_components/AuthFormHeader"
import { toast } from "react-toastify"
import { resetPassword } from "@/lib/auth-client"

interface PasswordState {
  password: string
  confirmPassword: string
}

function ResetPassword() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const error = searchParams.get("error")

  const [passwords, setPasswords] = useState<PasswordState>({
    password: "",
    confirmPassword: "",
  })
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (passwordError) {
      setPasswordError(null)
    }
  }

  const passwordChecks = {
    length: passwords.password?.length >= 8,
    uppercase: /[A-Z]/.test(passwords.password || ""),
    lowercase: /[a-z]/.test(passwords.password || ""),
    number: /[0-9]/.test(passwords.password || ""),
  }

  const passwordsMatch = passwords.password && passwords.confirmPassword && passwords.password === passwords.confirmPassword

  const validatePasswords = (): boolean => {
    if (passwords.password !== passwords.confirmPassword) {
      setPasswordError("Passwords do not match")
      return false
    }

    if (passwords.password.length < 8) {
      setPasswordError("Password must be at least 8 characters long")
      return false
    }

    if (!/[A-Z]/.test(passwords.password)) {
      setPasswordError("Password must contain at least one uppercase letter")
      return false
    }

    if (!/[a-z]/.test(passwords.password)) {
      setPasswordError("Password must contain at least one lowercase letter")
      return false
    }

    if (!/[0-9]/.test(passwords.password)) {
      setPasswordError("Password must contain at least one number")
      return false
    }

    return true
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validatePasswords()) {
      return
    }

    setIsSubmitting(true)

    try {
      const { error: resetError } = await resetPassword({
        newPassword: passwords.password,
        token: token as string,
      })
      if (resetError) {
        toast.error(resetError.message)
      } else {
        toast.success("Password reset successful")
        setTimeout(() => {
          router.push("/login")
        }, 2500)
      }
      setPasswords({ password: "", confirmPassword: "" })
    } catch (err) {
      toast.error("Failed to reset password")
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!token) {
      toast.error("Token is missing or invalid")
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    }

    if (error === "invalid_token") {
      toast.error("Token is invalid or expired")
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    }
  }, [token, error, router])

  return (
    <div className="w-full">
    <FieldGroup>
      <AuthFormHeader title="Set new password" description="Create a strong password to secure your account" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Field>
          <FieldLabel htmlFor="password">New Password</FieldLabel>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="••••••••"
              value={passwords.password}
              onChange={handleChange}
              disabled={isSubmitting}
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        {passwords.password && (
          <Field className="bg-muted/50 rounded-lg p-4 space-y-3">
            <p className="text-xs font-semibold text-foreground mb-2">Password Requirements:</p>
            <div className="flex items-center gap-2 text-xs">
              {passwordChecks.length ? (
                <Check className="w-4 h-4 text-green-500 shrink-0" />
              ) : (
                <X className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span className={passwordChecks.length ? "text-green-600 font-medium" : "text-red-500"}>
                At least 8 characters
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {passwordChecks.uppercase ? (
                <Check className="w-4 h-4 text-green-500 shrink-0" />
              ) : (
                <X className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span className={passwordChecks.uppercase ? "text-green-600 font-medium" : "text-red-500"}>
                One uppercase letter
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {passwordChecks.number ? (
                <Check className="w-4 h-4 text-green-500 shrink-0" />
              ) : (
                <X className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span className={passwordChecks.number ? "text-green-600 font-medium" : "text-red-500"}>
                One number
              </span>
            </div>
          </Field>
        )}

        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="••••••••"
              value={passwords.confirmPassword}
              onChange={handleChange}
              disabled={isSubmitting}
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {passwordError && <p className="text-sm text-destructive mt-2 font-medium">{passwordError}</p>}
        </Field>

        <Field>
          <Button type="submit" disabled={isSubmitting} className="w-full h-10 font-semibold">
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>
        </Field>

        <Field className="text-center pt-2">
          <Link
            href="/login"
            className="text-sm font-medium text-primary hover:text-primary/80 hover:underline transition-all duration-200"
          >
            Return to login
          </Link>
        </Field>
      </form>
    </FieldGroup>
  </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <>
      <Suspense fallback={<div className="flex items-center justify-center w-full h-screen">Loading...</div>}>
        <ResetPassword />
      </Suspense>
    </>
  )
}
