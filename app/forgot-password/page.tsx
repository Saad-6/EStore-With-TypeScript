"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "react-hot-toast"
import { LockIcon, MailIcon, ArrowRightIcon, CheckCircleIcon, KeyIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "../components/ui/input"

const API_BASE_URL = "https://localhost:7007/api"

// Step 1: Request OTP Schema
const requestOTPSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
})

// Step 2: Verify OTP Schema
const verifyOTPSchema = z.object({
  otp: z.string().length(4, { message: "OTP must be 4 digits" }),
})

// Step 3: Reset Password Schema
const resetPasswordSchema = z
  .object({
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

type RequestOTPFormValues = z.infer<typeof requestOTPSchema>
type VerifyOTPFormValues = z.infer<typeof verifyOTPSchema>
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

enum ForgotPasswordStep {
  REQUEST_OTP = 0,
  VERIFY_OTP = 1,
  RESET_PASSWORD = 2,
  SUCCESS = 3,
}

export default function ForgotPasswordPage() {
  const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>(ForgotPasswordStep.REQUEST_OTP)
  const [email, setEmail] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter()
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null])
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", ""])

  // Step 1: Request OTP Form
  const requestOTPForm = useForm<RequestOTPFormValues>({
    resolver: zodResolver(requestOTPSchema),
    defaultValues: {
      email: "",
    },
  })

  // Step 2: Verify OTP Form
  const verifyOTPForm = useForm<VerifyOTPFormValues>({
    resolver: zodResolver(verifyOTPSchema),
    defaultValues: {
      otp: "",
    },
  })

  // Step 3: Reset Password Form
  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
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

  // Step 1: Request OTP
  const onRequestOTP = async (data: RequestOTPFormValues) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/Auth/RequestOTP`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      })

      if (response.ok) {
        setEmail(data.email)
        setCurrentStep(ForgotPasswordStep.VERIFY_OTP)
        toast.success("OTP sent to your email")
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || "Failed to send OTP")
      }
    } catch (error) {
      console.error("Error requesting OTP:", error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Verify OTP
  const onVerifyOTP = async (data: VerifyOTPFormValues) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/Auth/VerifyOTP`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp: data.otp }),
      })

      if (response.ok) {
        setCurrentStep(ForgotPasswordStep.RESET_PASSWORD)
        toast.success("OTP verified successfully")
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || "Invalid OTP")
      }
    } catch (error) {
      console.error("Error verifying OTP:", error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Step 3: Reset Password
  const onResetPassword = async (data: ResetPasswordFormValues) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/Auth/ResetPassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password: data.password }),
      })

      if (response.ok) {
        setCurrentStep(ForgotPasswordStep.SUCCESS)
        toast.success("Password reset successfully")
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || "Failed to reset password")
      }
    } catch (error) {
      console.error("Error resetting password:", error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-focus first OTP input when step changes
  useEffect(() => {
    if (currentStep === ForgotPasswordStep.VERIFY_OTP) {
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
              <LockIcon className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            {currentStep === ForgotPasswordStep.REQUEST_OTP && "Enter your email to receive a verification code"}
            {currentStep === ForgotPasswordStep.VERIFY_OTP && "Enter the 4-digit code sent to your email"}
            {currentStep === ForgotPasswordStep.RESET_PASSWORD && "Create a new password for your account"}
            {currentStep === ForgotPasswordStep.SUCCESS && "Your password has been reset successfully"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {currentStep === ForgotPasswordStep.REQUEST_OTP && (
              <motion.div
                key="request-otp"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Form {...requestOTPForm}>
                  <form onSubmit={requestOTPForm.handleSubmit(onRequestOTP)} className="space-y-4">
                    <FormField
                      control={requestOTPForm.control}
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
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Sending..." : "Send Verification Code"}
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </Form>
              </motion.div>
            )}

            {currentStep === ForgotPasswordStep.VERIFY_OTP && (
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
                                  ref={(el) => (otpInputRefs.current[index] = el)}
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
                          setCurrentStep(ForgotPasswordStep.REQUEST_OTP)
                          setOtpValues(["", "", "", ""])
                        }}
                        disabled={isLoading}
                      >
                        Try again
                      </Button>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading || otpValues.join("").length !== 4}>
                      {isLoading ? "Verifying..." : "Verify Code"}
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </Form>
              </motion.div>
            )}

            {currentStep === ForgotPasswordStep.RESET_PASSWORD && (
              <motion.div
                key="reset-password"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Form {...resetPasswordForm}>
                  <form onSubmit={resetPasswordForm.handleSubmit(onResetPassword)} className="space-y-4">
                    <FormField
                      control={resetPasswordForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <KeyIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="password"
                                placeholder="Enter new password"
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
                      control={resetPasswordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <KeyIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="password"
                                placeholder="Confirm new password"
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
                      {isLoading ? "Resetting..." : "Reset Password"}
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </Form>
              </motion.div>
            )}

            {currentStep === ForgotPasswordStep.SUCCESS && (
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
                <h3 className="text-xl font-semibold">Password Reset Complete</h3>
                <p className="text-muted-foreground">
                  Your password has been reset successfully. You can now log in with your new password.
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
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/login")}>
              Back to login
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

