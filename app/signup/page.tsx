'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Label } from '../components/ui/label'
import { Input } from '../components/ui/input'
import { Checkbox } from '../components/ui/checkbox'
import { Button } from '../components/ui/button'
import toast, { Toaster } from 'react-hot-toast'
import { useAuth } from '../lib/auth'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('') // Reset error message

    // Basic validations
    if (!agreeTerms) {
      setError('You must agree to the terms and conditions.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    // Create a sign-up request payload
    const signUpData = {
      email,
      password,
      confirmPassword,
    }

    try {
      // Send the sign-up request to the backend
      console.log(signUpData)
      const response = await fetch('https://localhost:7007/api/Auth/Register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signUpData),
      })

      // Handle the response
      const data = await response.json()
      if (!response.ok) {
        console.log(data)
        setError(data.message || 'User registration failed!');
        toast.error(data.message || 'User registration failed!');
      } else {
        toast.success('User registered successfully!');
        router.push('/');
      }
    } catch (error) {
      console.error('Error during sign up:', error);
      setError('An error occurred while signing up. Please try again.');
      toast.error('An error occurred while signing up. Please try again.');
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Create an Account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-600 text-center mb-4">{error}</div>}
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="agreeTerms"
              checked={agreeTerms}
              onChange={(checked) => setAgreeTerms(checked as boolean)}
            />
            <Label htmlFor="agreeTerms">
              I agree to the{' '}
              <Link href="/terms" className="text-blue-600 hover:underline">
                Terms and Conditions
              </Link>
            </Label>
          </div>
          <Button type="submit" className="w-full" disabled={!agreeTerms}>
            Sign Up
          </Button>
        </form>
        <div className="mt-6 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
}
