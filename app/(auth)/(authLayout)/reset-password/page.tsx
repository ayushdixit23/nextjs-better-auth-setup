'use client'
import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from "motion/react";
import { FaLock } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from 'react-toastify';
import { resetPassword } from '@/lib/auth-client';

interface PasswordState {
    password: string;
    confirmPassword: string;
}

function ResetPassword() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    const [passwords, setPasswords] = useState<PasswordState>({
        password: '',
        confirmPassword: '',
    });
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswords((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (passwordError) {
            setPasswordError(null);
        }
    };

    const passwordChecks = {
        length: passwords.password?.length >= 8,
        uppercase: /[A-Z]/.test(passwords.password || ""),
        number: /[0-9]/.test(passwords.password || ""),
    };

    const validatePasswords = (): boolean => {
        if (passwords.password !== passwords.confirmPassword) {
            setPasswordError('Passwords do not match');
            return false;
        }

        if (passwords.password.length < 8) {
            setPasswordError('Password must be at least 8 characters long');
            return false;
        }

        if (!/[A-Z]/.test(passwords.password)) {
            setPasswordError('Password must contain at least one uppercase letter');
            return false;
        }

        if (!/[0-9]/.test(passwords.password)) {
            setPasswordError('Password must contain at least one number');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validatePasswords()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const { error: resetError } = await resetPassword({
                newPassword: passwords.password,
                token: token as string,
            });
            if (resetError) {
                toast.error(resetError.message);
            } else {
                toast.success('Password reset successful');
                setTimeout(() => {
                    router.push('/login');
                }, 2500);
            }
            setPasswords({ password: '', confirmPassword: '' });
        } catch (err) {
            toast.error('Failed to reset password');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (!token) {
            toast.error('Token is missing or invalid');
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        }

        if (error === 'invalid_token') {
            toast.error('Token is invalid or expired');
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        }
    }, [token, error, router]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="w-full max-w-xl"
        >
            <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-center mb-8"
                >
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Set new password</h2>
                    <p className="text-gray-600">Enter your new password below</p>
                </motion.div>

                {/* Form */}
                <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">New Password</label>
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <FaLock className="h-4 w-4 text-teal-500" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    className="pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none w-full"
                                    placeholder="New password"
                                    value={passwords.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Password Validation Indicators */}
                        {passwords.password && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-2"
                            >
                                <div className="flex items-center gap-2 text-xs">
                                    {passwordChecks.length ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <X className="w-4 h-4 text-red-400" />
                                    )}
                                    <span
                                        className={
                                            passwordChecks.length ? "text-green-600" : "text-red-500"
                                        }
                                    >
                                        At least 8 characters
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    {passwordChecks.uppercase ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <X className="w-4 h-4 text-red-400" />
                                    )}
                                    <span
                                        className={
                                            passwordChecks.uppercase ? "text-green-600" : "text-red-500"
                                        }
                                    >
                                        One uppercase letter
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    {passwordChecks.number ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <X className="w-4 h-4 text-red-400" />
                                    )}
                                    <span
                                        className={
                                            passwordChecks.number ? "text-green-600" : "text-red-500"
                                        }
                                    >
                                        One number
                                    </span>
                                </div>
                            </motion.div>
                        )}

                        <div>
                            <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <FaLock className="h-4 w-4 text-teal-500" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    className="pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none w-full"
                                    placeholder="Confirm new password"
                                    value={passwords.confirmPassword}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {passwordError && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-lg bg-red-50 border border-red-200 p-3"
                            >
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-red-800">{passwordError}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 px-4 rounded-lg shadow-md bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin h-5 w-5 text-white mr-2" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                                        <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Resetting...
                                </div>
                            ) : (
                                "Reset Password"
                            )}
                        </Button>
                    </motion.div>

                    {/* Back to Login Link */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="text-center"
                    >
                        <Link href="/login" className="text-sm font-medium text-teal-600 hover:text-teal-700">
                            Return to login
                        </Link>
                    </motion.div>
                </motion.form>
            </div>
        </motion.div>
    );
}

export default async function ResetPasswordPage() {
    return <>
        <Suspense fallback={<div className='flex items-center justify-center w-full h-screen'>Loading...</div>}>
            <ResetPassword />
        </Suspense>
    </>
}