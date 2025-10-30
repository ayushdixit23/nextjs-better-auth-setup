"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Shield, 
  Smartphone, 
  Check, 
  X, 
  Loader2, 
  Eye,
  EyeOff
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "react-toastify";
import QRCode from "react-qr-code";

interface TwoFactorAuthProps {
  user: any;
}

export default function TwoFactorAuth({ user }: TwoFactorAuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [totpUri, setTotpUri] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [step, setStep] = useState<'setup' | 'verify' | 'enabled'>('setup');
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.twoFactorEnabled) {
      setStep('enabled');
    }
  }, [user]);

  const handleEnable2FA = async () => {
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await authClient.twoFactor.enable({
        password,
      });

      if (error) {
        setError(error.message || "Failed to enable 2FA");
      } else if (data) {
        setTotpUri(data.totpURI);
        setStep('verify');
        toast.success("2FA setup initiated! Please scan the QR code and verify.");
      }
    } catch (err) {
      setError("An error occurred while enabling 2FA");
    } finally {
      setIsLoading(false);
      setPassword("");
    }
  };

  const handleVerifyTOTP = async () => {
    if (!verificationCode) {
      setError("Please enter the verification code");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const { data, error } = await authClient.twoFactor.verifyTotp({
        code: verificationCode,
      });

      if (error) {
        setError(error.message || "Invalid verification code");
      } else if (data) {
        setStep('enabled');
        toast.success("Two-factor authentication enabled successfully!");
      }
    } catch (err) {
      setError("An error occurred during verification");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await authClient.twoFactor.disable({
        password,
      });

      if (error) {
        setError(error.message || "Failed to disable 2FA");
      } else if (data) {
        setStep('setup');
        toast.success("Two-factor authentication disabled successfully!");
        // Refresh the page to update the user state
        window.location.reload();
      }
    } catch (err) {
      setError("An error occurred while disabling 2FA");
    } finally {
      setIsLoading(false);
    }
  };


  if (step === 'enabled') {
    return (
      <div className="rounded-lg border h-fit max-h-[550px] border-[#e5e7eb] bg-white p-6">
        <h2 className="mb-6 text-lg font-semibold text-[#111827]">Two-Factor Authentication</h2>

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#dcfce7]">
            <Shield className="h-10 w-10 text-[#16a34a]" />
          </div>

          <h3 className="mb-2 text-base font-semibold text-[#111827]">Enabled</h3>
          <p className="mb-6 text-sm text-[#6b7280]">
            Your account is protected with two-factor authentication.
          </p>

          <div className="w-full space-y-4">
            <div>
              <Label htmlFor="disable-password" className="text-sm font-medium text-[#374151]">
                Current Password
              </Label>
              <div className="relative mt-1.5">
                <Input
                  id="disable-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-md border border-[#fecaca] bg-[#fef2f2] p-3 text-sm text-[#991b1b]"
              >
                {error}
              </div>
            )}

            <Button
              onClick={handleDisable2FA}
              disabled={isLoading || !password}
              className="w-full bg-[#dc2626] hover:bg-[#dc2626]/90"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <X className="mr-2 h-4 w-4" />
              )}
              Disable 2FA
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className="rounded-lg border h-fit max-h-[550px] border-[#e5e7eb] bg-white p-6">
        <h2 className="mb-6 text-lg font-semibold text-[#111827]">Two-Factor Authentication Setup</h2>

        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-white rounded-lg border border-[#e5e7eb]">
              <QRCode value={totpUri} size={200} />
            </div>
            <div className="text-center">
              <p className="text-sm text-[#6b7280] mb-2">
                Scan this QR code with your authenticator app:
              </p>
              <p className="text-xs text-[#9ca3af]">Google Authenticator, Authy, Microsoft Authenticator</p>
            </div>
          </div>

          <div>
            <Label htmlFor="verification-code" className="text-sm font-medium text-[#374151]">
              Verification Code
            </Label>
            <Input
              id="verification-code"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="mt-1.5"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-md border border-[#fecaca] bg-[#fef2f2] p-3 text-sm text-[#991b1b]"
            >
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleVerifyTOTP}
              disabled={isVerifying || !verificationCode}
              className="flex-1 bg-[#0f766e] hover:bg-[#0f766e]/90"
            >
              {isVerifying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              {isVerifying ? "Verifying..." : "Verify & Enable"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setStep('setup')}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border h-fit max-h-[550px] border-[#e5e7eb] bg-white p-6">
      <h2 className="mb-6 text-lg font-semibold text-[#111827]">Two-Factor Authentication</h2>

      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#fee2e2]">
          <Shield className="h-10 w-10 text-[#dc2626]" />
        </div>

        <h3 className="mb-2 text-base font-semibold text-[#111827]">Not Enabled</h3>
        <p className="mb-6 text-sm text-[#6b7280]">
          Add an extra layer of security to your account by enabling two-factor authentication.
        </p>

        <div className="w-full space-y-4">
          <div>
            <Label htmlFor="password" className="text-sm font-medium text-[#374151]">
              Current Password
            </Label>
            <div className="relative mt-1.5">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-md border border-[#fecaca] bg-[#fef2f2] p-3 text-sm text-[#991b1b]"
            >
              {error}
            </div>
          )}

          <Button
            onClick={handleEnable2FA}
            disabled={isLoading || !password}
            className="w-full bg-[#0f766e] hover:bg-[#0f766e]/90"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Smartphone className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Enabling..." : "Enable 2FA"}
          </Button>

          <p className="mt-4 text-xs text-[#9ca3af]">
            Supports authenticator apps like:
            <br />
            Google Authenticator, Authy, Microsoft Authenticator
          </p>
        </div>
      </div>
    </div>
  );
}
