'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SocialProviders } from './SocialProviders'
import { AuthFormHeader } from './AuthFormHeader'
import { AuthFormFooter } from './AuthFormFooter'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema, type SignupFormData } from '@/lib/validations/auth'
import { showSuccessToast, showErrorToast } from '@/lib/toast-config'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Check, X } from 'lucide-react'
import { signUp } from '@/lib/auth-client'

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [signupError, setSignupError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const password = watch('password')
  const confirmPassword = watch('confirmPassword')

  // Password strength checks
  const passwordChecks = {
    length: (password?.length || 0) >= 8,
    uppercase: /[A-Z]/.test(password || ''),
    lowercase: /[a-z]/.test(password || ''),
    number: /[0-9]/.test(password || ''),
  }

  const passwordsMatch = password && confirmPassword && password === confirmPassword

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    setSignupError(null) // Clear previous errors
    
    try {
      await signUp.email(
        {
          email: data.email,
          password: data.password,
          name: data.name,
          callbackURL: '/verify-email',
        },
        {
          onSuccess: async (ctx) => {
            const { user } = ctx.data || {}

            // Check if user was created
            if (!user) {
              setSignupError('Account creation failed. Please try again.')
              showErrorToast('Account creation failed.')
              setIsLoading(false)
              return
            }

            // Successful signup
            showSuccessToast(`Account created successfully! Please check ${data.email} to verify.`)
            
            // Redirect to verify email page with email parameter
            setTimeout(() => {
              router.push(`/verify-email?email=${encodeURIComponent(data.email)}`)
              setIsLoading(false)
            }, 1000)
          },
          onError: (ctx) => {
            console.error('Signup error:', ctx.error)
            const errorMessage = ctx.error.message?.toLowerCase() || ''
            
            // Handle specific error cases
            switch (ctx.error.status) {
              case 400:
                // Check if it's a validation error
                if (errorMessage.includes('email')) {
                  setSignupError('Invalid email format. Please enter a valid email address.')
                  showErrorToast('Invalid email format.')
                } else if (errorMessage.includes('password')) {
                  setSignupError('Password does not meet requirements. Please check the requirements above.')
                  showErrorToast('Weak password.')
                } else {
                  setSignupError('Invalid input. Please check your details and try again.')
                  showErrorToast('Invalid input.')
                }
                break
                
              case 409:
                // Email already exists
                setSignupError('This email is already registered. Please login instead.')
                showErrorToast('Email already registered.')
                break
                
              case 429:
                setSignupError('Too many signup attempts. Please try again later.')
                showErrorToast('Too many attempts.')
                break
                
              case 500:
                setSignupError('Server error. Please try again later.')
                showErrorToast('Server error.')
                break
                
              default:
                setSignupError(ctx.error.message || 'Signup failed. Please try again.')
                showErrorToast(ctx.error.message || 'Signup failed.')
            }
            setIsLoading(false)
          },
        }
      )
    } catch (error: any) {
      console.error('Unexpected signup error:', error)
      setSignupError('An unexpected error occurred. Please try again.')
      showErrorToast('An unexpected error occurred.')
      setIsLoading(false)
    }
  }

  return (
    <form 
      className={cn("flex flex-col gap-6", className)} 
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        <AuthFormHeader 
          title="Create your account"
          description="Fill in the form below to create your account"
        />

        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input 
            id="name" 
            type="text" 
            placeholder="John Doe"
            {...register('name')}
            aria-invalid={errors.name ? 'true' : 'false'}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input 
            id="email" 
            type="email" 
            placeholder="m@example.com"
            {...register('email')}
            aria-invalid={errors.email ? 'true' : 'false'}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register('password')}
              aria-invalid={errors.password ? 'true' : 'false'}
              disabled={isLoading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
          )}
        </Field>

        {/* Password Strength Indicators */}
        {password && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              {passwordChecks.length ? (
                <Check className="w-4 h-4 text-green-500 shrink-0" />
              ) : (
                <X className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span className={passwordChecks.length ? "text-green-600" : "text-red-500"}>
                At least 8 characters
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {passwordChecks.uppercase ? (
                <Check className="w-4 h-4 text-green-500 shrink-0" />
              ) : (
                <X className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span className={passwordChecks.uppercase ? "text-green-600" : "text-red-500"}>
                One uppercase letter
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {passwordChecks.lowercase ? (
                <Check className="w-4 h-4 text-green-500 shrink-0" />
              ) : (
                <X className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span className={passwordChecks.lowercase ? "text-green-600" : "text-red-500"}>
                One lowercase letter
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {passwordChecks.number ? (
                <Check className="w-4 h-4 text-green-500 shrink-0" />
              ) : (
                <X className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span className={passwordChecks.number ? "text-green-600" : "text-red-500"}>
                One number
              </span>
            </div>
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
          <div className="relative">
            <Input 
              id="confirmPassword" 
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register('confirmPassword')}
              aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              disabled={isLoading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword ? (
            <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>
          ) : passwordsMatch ? (
            <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
              <Check className="w-3 h-3" />
              Passwords match
            </p>
          ) : (
            <FieldDescription>Please confirm your password</FieldDescription>
          )}
        </Field>

        {signupError && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-3">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium text-center">
              {signupError}
            </p>
          </div>
        )}

        <Field>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </Field>

        <SocialProviders mode="signup" />
        
        <AuthFormFooter 
          text="Already have an account?"
          linkText="Sign in"
          linkHref="/login"
        />
      </FieldGroup>
    </form>
  )
}
