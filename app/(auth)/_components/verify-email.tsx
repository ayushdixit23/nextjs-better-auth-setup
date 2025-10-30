"use client"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Mail, CheckCircle2, ExternalLink, RefreshCw, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup } from "@/components/ui/field"
import { AuthFormHeader } from "../_components/AuthFormHeader"
import { toast } from "react-toastify"
import { sendVerificationEmail } from "@/lib/auth-client"

export default function VerifyEmail() {
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [email, setEmail] = useState("")
  const [resendCount, setResendCount] = useState(0)
  const [lastResendTime, setLastResendTime] = useState<Date | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const searchParams = useSearchParams()

  const isEmailFound = !!email
  const isEmailSent = emailSent || resendSuccess
  const isRateLimited =
    resendCount >= 3 && lastResendTime && new Date().getTime() - lastResendTime.getTime() < 5 * 60 * 1000
  const canResend = !isResending && isEmailFound && !isRateLimited
  const isGmailUser = email.includes("@gmail.com")

  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    } 
  }, [searchParams])

  const handleResendEmail = async () => {
    if (!email) {
      toast.error("Email address not found")
      return
    }
    const now = new Date()
    if (lastResendTime && now.getTime() - lastResendTime.getTime() < 5 * 60 * 1000 && resendCount >= 3) {
      toast.error("Too many resend attempts. Please wait 5 minutes.")
      return
    }

    setIsResending(true)
    setResendSuccess(false)

    try {
      const result = await sendVerificationEmail({
        email: email,
        callbackURL: "/email-verification",
      })
      if (result.error) {

        toast.error(result.error.message || "Failed to resend verification email")
      } else {
        setResendSuccess(true)
        setEmailSent(true)
        setResendCount((prev) => prev + 1)
        setLastResendTime(now)
        toast.success("Verification email sent successfully!")

        setTimeout(() => setResendSuccess(false), 5000)
      }
    } catch {
      toast.error("Failed to resend verification email")
    } finally {
      setIsResending(false)
    }
  }

  const handleOpenGmail = () => {
    window.open("https://mail.google.com", "_blank")
  }

  const handleOpenEmailApp = () => {
    const isGmail = email.includes("@gmail.com")
    if (isGmail) {
      handleOpenGmail()
    } else {
      const domain = email.split("@")[1]
      const webmailUrls: { [key: string]: string } = {
        "outlook.com": "https://outlook.live.com",
        "hotmail.com": "https://outlook.live.com",
        "yahoo.com": "https://mail.yahoo.com",
        "icloud.com": "https://www.icloud.com/mail",
      }

      const webmailUrl = webmailUrls[domain]
      if (webmailUrl) {
        window.open(webmailUrl, "_blank")
      } else {
        window.location.href = "mailto:"
      }
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <FieldGroup>
        <AuthFormHeader title="Verify Your Email" description="We've sent a verification link to your email address" />

        {/* Success Message */}
        {isEmailSent && (
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 dark:text-green-300 text-sm mb-1">
                  Email Sent Successfully
                </h3>
                <p className="text-green-700 dark:text-green-400 text-xs">Check your inbox and spam folder</p>
              </div>
            </div>
          </div>
        )}

        {/* Email Display */}
        <Field>
          {isEmailFound ? (
            <div className="bg-muted rounded-lg p-4 text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold text-foreground">{email}</span>
              </div>
              <p className="text-xs text-muted-foreground">Verification email sent to this address</p>
            </div>
          ) : (
            <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4 text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="font-semibold text-yellow-900 dark:text-yellow-300">Email address not found</span>
              </div>
              <p className="text-xs text-yellow-700 dark:text-yellow-400">Please check your signup process</p>
            </div>
          )}
        </Field>

        {/* Next Steps */}
        <Field className="mb-6">
          <h3 className="font-semibold text-foreground mb-4">Next Steps:</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold text-sm">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground text-sm mb-1">Check your email inbox</h4>
                <p className="text-xs text-muted-foreground">Look for an email with subject "Verify your account"</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold text-sm">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground text-sm mb-1">Click the verification link</h4>
                <p className="text-xs text-muted-foreground">The link will expire in 24 hours for security</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold text-sm">
                3
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground text-sm mb-1">Access your dashboard</h4>
                <p className="text-xs text-muted-foreground">Complete your setup and start managing</p>
              </div>
            </div>
          </div>
        </Field>

        {/* Action Buttons */}
        {isEmailFound && (
          <Field>
            <Button onClick={handleOpenEmailApp} className="w-full h-10 font-semibold">
              <ExternalLink className="w-4 h-4 mr-2" />
              {isGmailUser ? "Open Gmail" : "Open Email App"}
            </Button>
          </Field>
        )}

        <Field>
          <Button
            onClick={handleResendEmail}
            disabled={!canResend}
            variant="outline"
            className="w-full h-10 font-semibold bg-transparent"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isResending ? "animate-spin" : ""}`} />
            {isResending ? "Sending..." : resendSuccess ? "Email Sent!" : "Resend Email"}
          </Button>

          {resendCount > 0 && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              Resent {resendCount} time{resendCount > 1 ? "s" : ""}
              {isRateLimited && (
                <span className="block text-destructive mt-1 font-medium">
                  Please wait 5 minutes before resending again
                </span>
              )}
            </p>
          )}
        </Field>

        {/* Troubleshooting */}
        <Field className="border-t pt-6 mb-6">
          <p className="text-center text-sm font-semibold text-foreground mb-4">Didn't receive the email?</p>
          <ul className="space-y-3 text-xs text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold mt-0.5">•</span>
              <span>Check your spam/junk folder</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold mt-0.5">•</span>
              <span>Make sure {email} is correct</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold mt-0.5">•</span>
              <span>Wait a few minutes and try again</span>
            </li>
          </ul>
        </Field>

        {/* Footer */}
        <Field className="border-t pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Need help?{" "}
            <a href="#" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Contact Support
            </a>
          </p>
        </Field>
      </FieldGroup>
    </div>
  )
}
