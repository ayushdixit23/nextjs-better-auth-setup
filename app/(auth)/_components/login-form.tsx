'use client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SocialProviders } from './SocialProviders'
import { AuthFormHeader } from './AuthFormHeader'
import { AuthFormFooter } from './AuthFormFooter'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import { showSuccessToast, showErrorToast, showWarningToast } from '@/lib/toast-config'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { sendVerificationEmail, signIn, twoFactor } from '@/lib/auth-client'
import { DEFAULT_REDIRECT_PATH } from '@/app/utils/constants'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export default function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      email: 'fsayush100@gmail.com',
      password: 'Ayushdixit23',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setLoginError(null)
    try {
      await signIn.email(
        {
          email: data.email,
          password: data.password,
          rememberMe: rememberMe,
          callbackURL: DEFAULT_REDIRECT_PATH,
        },
        {
          onSuccess: async (ctx) => {
            const { user, twoFactorRedirect } = ctx.data || {}

            if (twoFactorRedirect) {
              const { error } = await twoFactor.sendOtp();
              if (error) {
                showErrorToast(error.message || 'Failed to send OTP. Please try again.')
                setIsLoading(false)
                return
              }
              showSuccessToast(`OTP sent to ${data.email}. Please check your email.`)
              setTimeout(() => {
                router.push(`/2fa-verification?email=${encodeURIComponent(data.email)}`)
                setIsLoading(false)
              }, 500)
              return
            }

            if (!user) {
              setLoginError('Login failed. Please try again.')
              showErrorToast('Login failed. Please try again.')
              setIsLoading(false)
              return
            }

            showSuccessToast(`Welcome back, ${user.name || user.email}!`)
          },
          onError: async (ctx) => {
            switch (ctx.error.status) {
              case 401:
                setLoginError('Incorrect email or password. Please check your credentials and try again.')
                showErrorToast('Incorrect email or password.')
                break
              case 403:
                showWarningToast('Please verify your email before logging in. We are sending a verification email to your email address to verify your account and login again.')
                const result = await sendVerificationEmail({
                  email: data.email || '',
                  callbackURL: "/email-verification",
                })
                if (result.error) {
                  showErrorToast(result.error.message || 'Failed to send verification email. Please try again.')
                  setIsLoading(false)
                  return
                } else {
                  showSuccessToast('Verification email sent successfully! Please check your email to verify your account and login again.')
                  setTimeout(() => {
                    router.push(`/verify-email?email=${encodeURIComponent(data.email || '')}`)
                    setIsLoading(false)
                  }, 1500)
                }
                break
              case 429:
                setLoginError('Too many login attempts. Please try again later.')
                showErrorToast('Too many login attempts. Please try again later.')
                break
              default:
                setLoginError(ctx.error.message || 'Login failed. Please try again.')
                showErrorToast(ctx.error.message || 'Login failed due to server error.')
            }
            setIsLoading(false)
          },
        }
      )
    } catch (error: any) {
      setLoginError('An unexpected error occurred. Please try again.')
      showErrorToast('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6")} onSubmit={handleSubmit(onSubmit)}>
    <FieldGroup>
      <AuthFormHeader title="Login to your account" description="Enter your email below to login to your account" />

      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          {...register("email")}
          aria-invalid={errors.email ? "true" : "false"}
          disabled={isLoading}
        />
        {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
      </Field>

      <Field>
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            {...register("password")}
            aria-invalid={errors.password ? "true" : "false"}
            disabled={isLoading}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
      </Field>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            id="rememberMe"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === "indeterminate" ? true : checked)}
          />
          <Label htmlFor="rememberMe" className="text-sm cursor-pointer">
            Remember me
          </Label>
        </div>
        <Link href="/forgot-password" className="text-sm underline-offset-4 hover:underline">
          Forgot your password?
        </Link>
      </div>

      {loginError && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-3">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium text-center">{loginError}</p>
        </div>
      )}

      <Field>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </Field>

      <SocialProviders mode="login" />

      <AuthFormFooter text="Don't have an account?" linkText="Sign up" linkHref="/signup" />
    </FieldGroup>
  </form>
  )
}
