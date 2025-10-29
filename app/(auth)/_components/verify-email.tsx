"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Mail, CheckCircle2, ExternalLink, RefreshCw, Shield, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "react-toastify"
import { authClient, sendVerificationEmail } from "@/lib/auth-client"

export default function VerifyEmail() {
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [email, setEmail] = useState("")
  const [resendCount, setResendCount] = useState(0)
  const [lastResendTime, setLastResendTime] = useState<Date | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [emailError, setEmailError] = useState(false)
  const searchParams = useSearchParams()

  // Proper conditions for different states
  const isEmailFound = !!email
  const isEmailSent = emailSent || resendSuccess
  const isRateLimited = resendCount >= 3 && lastResendTime && new Date().getTime() - lastResendTime.getTime() < 5 * 60 * 1000
  const canResend = !isResending && isEmailFound && !isRateLimited
  const isGmailUser = email.includes('@gmail.com')

  // Get email from URL params or session
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    } else {
      // Try to get email from session
      authClient.getSession().then((session) => {
        if (session?.data?.user?.email) {
          setEmail(session.data.user.email)
        }
      })
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
        callbackURL: "/email-verification"
      })
      if (result.error) {
        setEmailError(true)
        toast.error(result.error.message || "Failed to resend verification email")
      } else {
        setResendSuccess(true)
        setEmailSent(true)
        setResendCount(prev => prev + 1)
        setLastResendTime(now)
        toast.success("Verification email sent successfully!")
        
        setTimeout(() => setResendSuccess(false), 5000)
      }
    } catch (error) {
      console.error('Resend error:', error)
      setEmailError(true)
      toast.error("Failed to resend verification email")
    } finally {
      setIsResending(false)
    }
  }

  const handleOpenGmail = () => {
    window.open('https://mail.google.com', '_blank')
  }

  const handleOpenEmailApp = () => {
    // Try to open default email client with Gmail as fallback
    const isGmail = email.includes('@gmail.com')
    if (isGmail) {
      handleOpenGmail()
    } else {
      // For other email providers, try to open their webmail
      const domain = email.split('@')[1]
      const webmailUrls: { [key: string]: string } = {
        'outlook.com': 'https://outlook.live.com',
        'hotmail.com': 'https://outlook.live.com',
        'yahoo.com': 'https://mail.yahoo.com',
        'icloud.com': 'https://www.icloud.com/mail'
      }
      
      const webmailUrl = webmailUrls[domain]
      if (webmailUrl) {
        window.open(webmailUrl, '_blank')
      } else {
        // Fallback to default mailto
        window.location.href = "mailto:"
      }
    }
  }

  return (
    <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 md:p-10">
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-[#e0f2f1] flex items-center justify-center">
          <Mail className="w-10 h-10 text-[#0f766e]" />
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#111827] mb-2">Verify Your Email</h1>
        <p className="text-[#6b7280] text-sm">We've sent a verification link to your email address</p>
      </div>

      {/* Success Message - Show when email is sent successfully */}
      {isEmailSent && (
        <div className="bg-[#dcfce7] border border-[#bbf7d0] rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#16a34a] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-[#166534] text-sm mb-1">Email Sent Successfully</h3>
              <p className="text-[#16a34a] text-xs">Check your inbox and spam folder</p>
            </div>
          </div>
        </div>
      )}

      {/* Email Display - Show email if found, error if not */}
      {isEmailFound ? (
        <div className="bg-[#f9fafb] rounded-lg p-4 mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Mail className="w-4 h-4 text-[#6b7280]" />
            <span className="font-medium text-[#111827]">{email}</span>
          </div>
          <p className="text-xs text-[#9ca3af]">Verification email sent to this address</p>
        </div>
      ) : (
        <div className="bg-[#fef3c7] border border-[#fde68a] rounded-lg p-4 mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-[#d97706]" />
            <span className="font-medium text-[#92400e]">Email address not found</span>
          </div>
          <p className="text-xs text-[#a16207]">Please check your signup process</p>
        </div>
      )}

      {/* Next Steps */}
      <div className="mb-6">
        <h3 className="font-semibold text-[#111827] mb-4">Next Steps:</h3>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-[#0f766e] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">1</span>
            </div>
            <div>
              <h4 className="font-medium text-[#111827] text-sm mb-1">Check your email inbox</h4>
              <p className="text-xs text-[#6b7280]">
                Look for an email from PharmaCare with subject "Verify your account"
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-[#0f766e] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">2</span>
            </div>
            <div>
              <h4 className="font-medium text-[#111827] text-sm mb-1">Click the verification link</h4>
              <p className="text-xs text-[#6b7280]">The link will expire in 24 hours for security</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-[#0f766e] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">3</span>
            </div>
            <div>
              <h4 className="font-medium text-[#111827] text-sm mb-1">Access your dashboard</h4>
              <p className="text-xs text-[#6b7280]">Complete your pharmacy setup and start managing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 mb-6">
        {/* Open Email App Button - Only show if email is found */}
        {isEmailFound && (
          <Button
            onClick={handleOpenEmailApp}
            className="w-full bg-[#0f766e] hover:bg-[#0d9488] text-white font-medium py-6 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            {isGmailUser ? 'Open Gmail' : 'Open Email App'}
          </Button>
        )}

        {/* Resend Email Button - Show proper states and conditions */}
        <Button
          onClick={handleResendEmail}
          disabled={!canResend}
          variant="outline"
          className={`w-full border-2 border-[#e5e7eb] hover:bg-[#f9fafb] text-[#111827] font-medium py-6 rounded-lg transition-colors ${
            !canResend ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isResending ? "animate-spin" : ""}`} />
          {isResending ? "Sending..." : resendSuccess ? "Email Sent!" : "Resend Email"}
        </Button>

        {/* Resend Status - Show count and rate limit info */}
        {resendCount > 0 && (
          <p className="text-xs text-[#6b7280] text-center">
            Resent {resendCount} time{resendCount > 1 ? 's' : ''}
            {isRateLimited && (
              <span className="block text-[#dc2626] mt-1">
                Please wait 5 minutes before resending again
              </span>
            )}
          </p>
        )}
      </div>

      {/* Troubleshooting */}
      <div className="border-t border-[#e5e7eb] pt-6">
        <p className="text-center text-sm font-medium text-[#111827] mb-3">Didn't receive the email?</p>
        <ul className="space-y-2 text-xs text-[#6b7280]">
          <li className="flex items-start gap-2">
            <span className="text-[#0f766e] mt-0.5">•</span>
            <span>Check your spam/junk folder</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#0f766e] mt-0.5">•</span>
            <span>Make sure {email} is correct</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#0f766e] mt-0.5">•</span>
            <span>Wait a few minutes and try again</span>
          </li>
        </ul>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-[#e5e7eb]">
        <p className="text-center text-xs text-[#6b7280] mb-4">
          Need help?{" "}
          <a href="#" className="text-[#0f766e] hover:underline font-medium">
            Contact Support
          </a>
        </p>

        <div className="flex items-center justify-center gap-4 text-xs text-[#9ca3af]">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-[#16a34a]" />
            <span>SSL Secured</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#3b82f6]" />
            <span>24h Link Expiry</span>
          </div>
        </div>
      </div>
    </div>
  )
}
