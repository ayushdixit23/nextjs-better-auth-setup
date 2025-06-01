import { AvatarFallback } from '@/components/ui/avatar'
import { FaEnvelope, FaLock, FaUser, FaUserCircle } from 'react-icons/fa'
import { AvatarImage } from '@/components/ui/avatar'
import { Avatar } from '@/components/ui/avatar'
import { motion } from 'motion/react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { signUp } from '@/auth-client'
import { toast } from 'react-toastify'
import { FiEye, FiEyeOff } from 'react-icons/fi'

// Zod schema for form validation
const signupSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    username: z
        .string()
        .min(3, { message: "Username must be at least 3 characters" })
        .max(20, { message: "Username cannot exceed 20 characters" })
        .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers and underscores" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    image: z.any().optional(),
});

type SignUpFormValues = z.infer<typeof signupSchema>

const SignUpForm = () => {
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<SignUpFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "Ayush Dixit",
            username: "ayushdixit23",
            email: "fsayush100@gmail.com",
            password: "Password1234",
            image: null,
        },
    });

    const onSubmit = async (signupData: SignUpFormValues) => {
        try {
            setIsLoading(true)

            const { email, password, name, image, username } = signupData

            const { error } = await signUp.email({
                email,
                password,
                name,
                image,

            }, {
                body: {
                    username
                }
            });

            if (error) {
                toast.error(error.message)
            } else {
                toast.success("Account created successfully, please verify your email to login")
            }

        } catch (error) {
            console.log(error)
            toast.error("Login failed")
        } finally {
            setIsLoading(false)
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            form.setValue("image", file);
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                if (result) {
                    setAvatarPreview(result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    return (
        <Form  {...form}>
            <motion.form
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
            >
                {/* Profile Image */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col items-center space-y-2 mb-6"
                >
                    <Avatar className="w-24 h-24 border-2 border-indigo-100">
                        <AvatarImage src={avatarPreview || ""} className='object-cover rounded-full' />
                        <AvatarFallback className="bg-indigo-100 text-indigo-700">
                            <FaUserCircle className="w-12 h-12" />
                        </AvatarFallback>
                    </Avatar>

                    <Label htmlFor="image" className="cursor-pointer inline-flex items-center mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-500">
                        Upload profile picture
                    </Label>
                    <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                    />
                </motion.div>

                {/* Name */}
                <motion.div variants={itemVariants}>
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <FaUser className="h-5 w-5 text-indigo-400" />
                                        </div>
                                        <Input
                                            placeholder="Full Name"
                                            {...field}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage className="text-xs mt-1 ml-1 text-red-500" />
                            </FormItem>
                        )}
                    />
                </motion.div>


                {/* Email */}
                <motion.div variants={itemVariants}>
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <FaEnvelope className="h-5 w-5 text-indigo-400" />
                                        </div>
                                        <Input
                                            type="email"
                                            placeholder="Email address"
                                            {...field}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage className="text-xs mt-1 ml-1 text-red-500" />
                            </FormItem>
                        )}
                    />
                </motion.div>

                {/* Username */}
                <motion.div variants={itemVariants}>
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <span className="text-indigo-400 font-medium">@</span>
                                        </div>
                                        <Input
                                            type='text'
                                            placeholder="Username"
                                            {...field}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage className="text-xs mt-1 ml-1 text-red-500" />
                            </FormItem>
                        )}
                    />
                </motion.div>

                {/* Password */}
                <motion.div variants={itemVariants}>
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
                </motion.div>

                {/* Submit Button */}
                <motion.div variants={itemVariants}>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 border border-transparent rounded-lg shadow-md text-white bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 font-medium transition duration-200"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating account...
                            </>
                        ) : "Create Account"}
                    </Button>
                </motion.div>
            </motion.form>
        </Form>
    )
}

export default SignUpForm
