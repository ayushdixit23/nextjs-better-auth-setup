"use client"
import { useState, type FormEvent } from "react"
import Link from "next/link"
import { Mail, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { AuthFormHeader } from "../../_components/AuthFormHeader"
import { forgetPassword } from "@/lib/auth-client"

export default function ForgotPassword() {
  const [email, setEmail] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setMessage(null)

    try {
      const { error } = await forgetPassword({
        email: email,
        redirectTo: "/reset-password",
      })
      if (error) {
        setError(error?.message || "Failed to send reset link. Please try again.")
      } else {
        setMessage("Reset link sent! Please check your email inbox.")
      }
      setEmail("")
    } catch (err: any) {
      setError("Failed to send reset link. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
    <FieldGroup>
      <AuthFormHeader
        title="Reset your password"
        description="Enter your email address and we'll send you a link to reset your password."
      />

      {message && (
        <div className="rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-4 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-900 dark:text-green-300">{message}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Field>
          <FieldLabel htmlFor="email">Email Address</FieldLabel>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="pl-10"
            />
          </div>
        </Field>

        <Field>
          <Button type="submit" disabled={isSubmitting} className="w-full h-10 font-semibold">
            {isSubmitting ? "Sending..." : "Send reset link"}
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
