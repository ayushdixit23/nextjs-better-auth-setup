"use client";

import { useState, useRef, useEffect, type KeyboardEvent, type ClipboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient, twoFactor } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { AuthFormHeader } from "../../../_components/AuthFormHeader";
import { Shield, CheckCircle2, Clock, Mail, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import { DEFAULT_REDIRECT_PATH } from "@/app/utils/constants";

export default function OTPVerificationContent() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if email parameter exists in URL
  useEffect(() => {
    const checkEmailParam = () => {
      const email = searchParams.get('email');
      
      if (!email) {
        router.push("/login");
        return;
      }
      
      // Email parameter exists, allow access
      setIsAuthorized(true);
      setIsCheckingAuth(false);
    };

    checkEmailParam();
  }, [searchParams, router]);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < 6) {
        newOtp[index] = char;
      }
    });
    setOtp(newOtp);

    // Focus last filled input or last input
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }
    setIsVerifying(true);
    setError("");
    try {
      const { data, error } = await twoFactor.verifyOtp({
        code: otpCode,
        trustDevice: true,
      });

      if (error) {
        setError(error.message || "Invalid verification code");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else if (data) {
        setIsVerified(true);
        toast.success("Login Successfully!");
        setTimeout(() => {
          router.push(DEFAULT_REDIRECT_PATH);
        }, 2000);
      }
    } catch (err) {
      setError("An error occurred during verification");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };


  const handleResend = async () => {
    setIsResending(true);
    setError("");

    try {
      const { error } = await twoFactor.sendOtp();

      if (error) {
        toast.error(error.message || "Failed to resend code");
      } else {
        toast.success("New verification code sent to your email");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      toast.error("Failed to resend code");
    } finally {
      setIsResending(false);
      setTimer(60);
      setCanResend(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Show loading state while checking authorization
  if (isCheckingAuth) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <FieldGroup>
          <div className="flex flex-col items-center space-y-4 py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </FieldGroup>
      </div>
    );
  }

  // Show unauthorized access message
  if (!isAuthorized) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <FieldGroup>
          <div className="flex flex-col items-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <AuthFormHeader 
              title="Access Denied"
              description="You need to log in first before accessing the 2FA verification page."
            />
            <Field>
              <Button
                onClick={() => router.push("/login")}
                className="w-full"
              >
                Go to Login
              </Button>
            </Field>
          </div>
        </FieldGroup>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <FieldGroup>
        <AuthFormHeader 
          title="Two-Factor Authentication"
          description="Enter the 6-digit code sent to your email"
        />

        {isVerified ? (
          <Field>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-green-900">Verification Successful</p>
                  <p className="text-sm text-green-700 mt-1">You will be redirected to your dashboard</p>
                </div>
              </div>
            </div>
          </Field>
        ) : (
          <>
            <Field>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">OTP sent to {searchParams.get('email')}</p>
                    <p className="text-xs text-blue-700 mt-0.5">Check your email for the 6-digit verification code</p>
                  </div>
                </div>
              </div>
            </Field>

            <Field>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`w-12 h-14 text-center text-xl font-semibold border-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary ${error ? "border-destructive bg-red-50" : "border-input bg-background"
                      }`}
                    disabled={isVerifying || isVerified}
                  />
                ))}
              </div>
              {error && <p className="text-sm text-destructive text-center mt-2">{error}</p>}
            </Field>

            <Field className="text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  Code expires in <span className="font-semibold">{formatTime(timer)}</span>
                </span>
              </div>
            </Field>

            <Field>
              <Button
                onClick={handleVerify}
                disabled={isVerifying || otp.some((d) => !d)}
                className="w-full"
              >
                {isVerifying ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  "Verify Code"
                )}
              </Button>
            </Field>

            <Field>
              <Button
                onClick={handleResend}
                disabled={!canResend || isResending}
                variant="outline"
                className="w-full"
              >
                {isResending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Resending...
                  </div>
                ) : canResend ? (
                  "Resend Code"
                ) : (
                  `Resend Code (${formatTime(timer)})`
                )}
              </Button>
            </Field>

            <Field className="border-t pt-6">
              <p className="text-sm text-foreground text-center mb-3">
                Didn't receive the code?
              </p>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Check your email inbox and spam folder</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Make sure you're checking the correct email address</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Click "Resend Code" if you haven't received it</span>
                </li>
              </ul>
            </Field>

            <Field className="border-t pt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Need help? <button className="text-primary hover:underline font-medium">Contact Support</button>
              </p>
            </Field>
          </>
        )}
      </FieldGroup>
    </div>
  );
}
