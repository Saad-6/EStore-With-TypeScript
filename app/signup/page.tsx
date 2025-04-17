"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "react-hot-toast"
import { UserIcon, MailIcon, ArrowRightIcon, CheckCircleIcon, KeyIcon, UserPlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "../components/ui/input"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7007/api"

// Step 1: Collect User Info Schema
const userInfoSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

// Step 2: Verify OTP Schema
const verifyOTPSchema = z.object({
  otp: z.string().length(4, { message: "OTP must be 4 digits" }),
})

type UserInfoFormValues = z.infer<typeof userInfoSchema>
type VerifyOTPFormValues = z.infer<typeof verifyOTPSchema>

enum SignUpStep {
  USER_INFO = 0,
  VERIFY_OTP = 1,
  SUCCESS = 2,
}

export default function SignUpPage() {
  const [currentStep, setCurrentStep] = useState<SignUpStep>(SignUpStep.USER_INFO)
  const [userInfo, setUserInfo] = useState<UserInfoFormValues | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter()
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null])
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", ""])

  // Step 1: User Info Form
  const userInfoForm = useForm<UserInfoFormValues>({
    resolver: zodResolver(userInfoSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  // Step 2: Verify OTP Form
  const verifyOTPForm = useForm<VerifyOTPFormValues>({
    resolver: zodResolver(verifyOTPSchema),
    defaultValues: {
      otp: "",
    },
  })

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1)
    }

    const newOtpValues = [...otpValues]
    newOtpValues[index] = value
    setOtpValues(newOtpValues)

    // Auto-focus next input
    if (value && index < 3) {
      otpInputRefs.current[index + 1]?.focus()
    }

    // Update form value
    verifyOTPForm.setValue("otp", newOtpValues.join(""))
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace") {
      if (!otpValues[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus()
      }
    }
  }

  // Step 1: Submit User Info and Request OTP
  const onSubmitUserInfo = async (data: UserInfoFormValues) => {
    setIsLoading(true)
    try {
      // Store user info for later registration
      setUserInfo(data)

      // Request OTP
      const response = await fetch(`${API_BASE_URL}/Auth/RequestOTP`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          isPasswordRecovery: false, // This is for signup, not password recovery
        }),
      })

      if (response.ok) {
        setCurrentStep(SignUpStep.VERIFY_OTP)
        toast.success("Verification code sent to your email")
      } else {
        const errorData = await response.text()
        toast.error(errorData || "Failed to send verification code")
      }
    } catch (error) {
      console.error("Error requesting OTP:", error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Verify OTP and Register User
  const onVerifyOTP = async (data: VerifyOTPFormValues) => {
    if (!userInfo) return

    setIsLoading(true)
    try {
      // First verify the OTP
      const verifyResponse = await fetch(`${API_BASE_URL}/Auth/VerifyOTP`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userInfo.email,
          otp: data.otp,
        }),
      })

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.text()
        toast.error(errorData || "Invalid verification code")
        setIsLoading(false)
        return
      }

      // If OTP is verified, proceed with registration
      const registerResponse = await fetch(`${API_BASE_URL}/Auth/Register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userInfo.name,
          email: userInfo.email,
          password: userInfo.password,
          confirmPassword: userInfo.confirmPassword,
        }),
      })

      if (registerResponse.ok) {
        setCurrentStep(SignUpStep.SUCCESS)
        toast.success("Account created successfully")
      } else {
        const errorData = await registerResponse.json()
        toast.error(errorData.message || "Failed to create account")
      }
    } catch (error) {
      console.error("Error during registration:", error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-focus first OTP input when step changes
  useEffect(() => {
    if (currentStep === SignUpStep.VERIFY_OTP) {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus()
      }, 100)
    }
  }, [currentStep])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-primary/10 via-background to-background dark:from-primary/5 dark:via-background dark:to-background">
      <Card className="w-full max-w-md shadow-lg border-primary/20">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlusIcon className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">
            {currentStep === SignUpStep.USER_INFO && "Enter your details to create an account"}
            {currentStep === SignUpStep.VERIFY_OTP && "Enter the 4-digit code sent to your email"}
            {currentStep === SignUpStep.SUCCESS && "Your account has been created successfully"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {currentStep === SignUpStep.USER_INFO && (
              <motion.div
                key="user-info"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Form {...userInfoForm}>
                  <form onSubmit={userInfoForm.handleSubmit(onSubmitUserInfo)} className="space-y-4">
                    <FormField
                      control={userInfoForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="Enter your name" className="pl-10" {...field} disabled={isLoading} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={userInfoForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MailIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="Enter your email" className="pl-10" {...field} disabled={isLoading} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={userInfoForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <KeyIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="password"
                                placeholder="Create a password"
                                className="pl-10"
                                {...field}
                                disabled={isLoading}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={userInfoForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <KeyIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="password"
                                placeholder="Confirm your password"
                                className="pl-10"
                                {...field}
                                disabled={isLoading}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Processing..." : "Continue"}
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </Form>
              </motion.div>
            )}

            {currentStep === SignUpStep.VERIFY_OTP && (
              <motion.div
                key="verify-otp"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Form {...verifyOTPForm}>
                  <form onSubmit={verifyOTPForm.handleSubmit(onVerifyOTP)} className="space-y-4">
                    <FormField
                      control={verifyOTPForm.control}
                      name="otp"
                      render={() => (
                        <FormItem>
                          <FormLabel>Verification Code</FormLabel>
                          <FormControl>
                            <div className="flex justify-between gap-2">
                              {[0, 1, 2, 3].map((index) => (
                                <Input
                                  key={index}
                                  ref={(el) => {
                                    otpInputRefs.current[index] = el
                                  }}
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  maxLength={1}
                                  className="w-14 h-14 text-center text-xl"
                                  value={otpValues[index]}
                                  onChange={(e) => handleOtpChange(index, e.target.value)}
                                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                  disabled={isLoading}
                                />
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="text-sm text-center">
                      <span className="text-muted-foreground">Didn't receive a code? </span>
                      <Button
                        variant="link"
                        className="p-0 h-auto"
                        onClick={() => {
                          if (userInfo) {
                            userInfoForm.setValue("email", userInfo.email)
                            userInfoForm.setValue("name", userInfo.name)
                            userInfoForm.setValue("password", userInfo.password)
                            userInfoForm.setValue("confirmPassword", userInfo.confirmPassword)
                          }
                          setCurrentStep(SignUpStep.USER_INFO)
                          setOtpValues(["", "", "", ""])
                        }}
                        disabled={isLoading}
                      >
                        Try again
                      </Button>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading || otpValues.join("").length !== 4}>
                      {isLoading ? "Verifying..." : "Create Account"}
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </Form>
              </motion.div>
            )}

            {currentStep === SignUpStep.SUCCESS && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center space-y-4"
              >
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-500" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold">Registration Complete</h3>
                <p className="text-muted-foreground">
                  Your account has been created successfully. You can now log in with your email and password.
                </p>
                <Button onClick={() => router.push("/login")} className="w-full">
                  Go to Login
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="w-full h-1 bg-muted overflow-hidden rounded-full">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(currentStep / 2) * 100}%` }}
            />
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/login")}>
              Log in
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
