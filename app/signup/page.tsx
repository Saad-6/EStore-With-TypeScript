"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "../components/ui/input"
import { Checkbox } from "../components/ui/checkbox"
import { Button } from "../components/ui/button"
import toast from "react-hot-toast"
import { useAuth } from "../lib/auth"
import { Label } from "@/components/ui/label"

const API_BASE_URL = "https://localhost:7007/api"


export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("") // Reset error message

    // Basic validations
    if (!agreeTerms) {
      setError("You must agree to the terms and conditions.")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    // Create a sign-up request payload
    const signUpData = {
      name,
      email,
      password,
      confirmPassword,
    }

    try {
      // Send the sign-up request to the backend
      console.log(signUpData)
      const response = await fetch(`${API_BASE_URL}/Auth/Register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signUpData),
      })

      // Handle the response
      const data = await response.json()
      if (!response.ok) {
        console.log(data)
        setError(data.message || "User registration failed!")
        toast.error(data.message || "User registration failed!")
      } else {
        toast.success("User registered successfully!")
        router.push("/")
      }
    } catch (error) {
      console.error("Error during sign up:", error)
      setError("An error occurred while signing up. Please try again.")
      toast.error("An error occurred while signing up. Please try again.")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center dark:text-white">Create an Account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-600 text-center mb-4 dark:text-red-400">{error}</div>}
          <div>
            <Label htmlFor="name" className="dark:text-white">
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <Label htmlFor="email" className="dark:text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <Label htmlFor="password" className="dark:text-white">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword" className="dark:text-white">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-center space-x-2">
          <Checkbox id="agreeTerms" checked={agreeTerms} onChange={(checked) => setAgreeTerms(checked)} />
            <Label htmlFor="agreeTerms" className="dark:text-white">
              I agree to the{" "}
              <Link href="/terms" className="text-blue-600 hover:underline dark:text-blue-400">
                Terms and Conditions
              </Link>
            </Label>
          </div>
          <Button type="submit" className="w-full" disabled={!agreeTerms}>
            Sign Up
          </Button>
        </form>
        <div className="mt-6 text-center dark:text-white">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
}

