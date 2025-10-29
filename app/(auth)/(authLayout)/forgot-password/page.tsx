"use client"
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { motion } from "motion/react";
import { FaEnvelope } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { forgetPassword } from '@/lib/auth-client';

export default function ForgotPassword() {
    const [email, setEmail] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setMessage(null);

        try {
            const { error } = await forgetPassword({
                email: email,
                redirectTo: "/reset-password",
            });
            if (error) {
                setError(error?.message || 'Failed to send reset link. Please try again.');
            } else {
                setMessage('Reset link sent! Please check your email inbox.');
            }
            setEmail('');
        } catch (err: any) {
            setError('Failed to send reset link. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset your password</h2>
                    <p className="text-gray-600">Enter your email address and we'll send you a link to reset your password.</p>
                </motion.div>

                {/* Messages */}
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg bg-green-50 border border-green-200 p-4 mb-6"
                    >
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">{message}</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg bg-red-50 border border-red-200 p-4 mb-6"
                    >
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800">{error}</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Form */}
                <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    <div>
                        <label className="text-sm font-medium text-gray-700">Email Address</label>
                        <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <FaEnvelope className="h-4 w-4 text-teal-500" />
                            </div>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                required
                                className="pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none w-full"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
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
                                    Sending...
                                </div>
                            ) : (
                                "Send reset link"
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
