import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FaEnvelope } from 'react-icons/fa'
import { Form } from '@/components/ui/form'
import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { motion } from 'motion/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FaLock } from 'react-icons/fa'
import { z } from 'zod'
import { signIn } from '@/auth-client'
import { toast } from 'react-toastify'
import Link from 'next/link'
import { FiEye, FiEyeOff } from "react-icons/fi";


const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

const LoginForm = () => {
    const [isLoading, setIsLoading] = useState(false)
    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "fsayush100@gmail.com",
            password: "Password1234",
        },
    })

    const onSubmit = async (userData: LoginFormValues) => {
        try {
            setIsLoading(true)
            const { data, error } = await signIn.email({ email: userData.email, password: userData.password, callbackURL: "/" })
            if (error) {
                toast.error(error.message)
            } else {
                console.log(data, "data")
                toast.success("Login successful")
            }
        } catch (error) {
            console.log(error)
            toast.error("Login failed")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form  {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-5">

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">Email address</FormLabel>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <FaEnvelope className="h-5 w-5 text-indigo-400" />
                                    </div>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="you@example.com"
                                            className="pl-10 pr-3 py-3 border border-gray-300 rounded-md bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full"
                                            {...field}
                                        />
                                    </FormControl>
                                </div>
                                <FormMessage className="text-red-500" />
                            </FormItem>
                        )}
                    />
                    
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => {
                            const [showPassword, setShowPassword] = useState(false);

                            return (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-gray-700">Password</FormLabel>
                                    <div className="relative">
                                        {/* Lock icon on the left */}
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <FaLock className="h-5 w-5 text-indigo-400" />
                                        </div>

                                        <FormControl>
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                className="pl-10 pr-10 py-3 border border-gray-300 rounded-md bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full"
                                                {...field}
                                            />
                                        </FormControl>

                                        {/* Toggle button (eye icon) on the right */}
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 focus:outline-none"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <FormMessage className="text-red-500" />
                                </FormItem>
                            );
                        }}
                    />
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                    <label className="flex items-center space-x-2 text-sm text-gray-600">
                        <input
                            type="checkbox"
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span>Remember me</span>
                    </label>
                    <Link href="/forgot-password" className="text-sm text-indigo-600 hover:underline">
                        Forgot password?
                    </Link>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 rounded-md shadow-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition"
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white mx-auto" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                                <path
                                    fill="currentColor"
                                    className="opacity-75"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                            </svg>
                        ) : (
                            "Sign in"
                        )}
                    </Button>
                </motion.div>
            </form>
        </Form>
    )
}

export default LoginForm
