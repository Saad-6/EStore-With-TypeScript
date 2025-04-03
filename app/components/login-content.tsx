'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { jwtDecode } from 'jwt-decode'
import { useAuth } from '../lib/auth'
import toast, { Toaster } from 'react-hot-toast'
import { BouncingDotsLoader, SpinningCircleLoader } from './ui/Loaders'
import { Label } from '@/components/ui/label'

const API_BASE_URL = "https://localhost:7007/api"

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const { isAuthenticated,userRole, login } = useAuth()
  const[isLoading,setIsLoading] = useState(false);
  useEffect(() => {
    if (isAuthenticated && userRole ==='Admin') {
      router.push('/admin')
    }else if(isAuthenticated && userRole !=="Admin"){
      router.push('/')
    }
  }, [isAuthenticated, router])

  // DTO structure for login
  const loginDTO = {
    email,
    password,
  }

  interface ApiResponse {
    success: boolean;
    token: string;
  }

  interface Token {
    userId: string;
    email: string;
    userName: string;
    role: string;
    exp: number;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/Auth/Login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginDTO),
      })

      if (response.ok) {
        const data: ApiResponse = await response.json()

        // Use the login function from useAuth hook
        login(data.token)

        const decodedToken: Token = jwtDecode(data.token)

        // Check if the user is an admin and redirect accordingly
        if (decodedToken.role === 'Admin') {
          router.push('/admin')
        } else {
          router.push('/')
        }
      } else {
        toast.error('Email or Password Invalid');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      toast.error('Connection to the server could not be established');
    }
    setIsLoading(false);
  }

  return (
    
    <div className="container mx-auto px-4 py-8">
    
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Login to Your Account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="dark:text-white" htmlFor="email">Email</Label>
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
            <Label className="dark:text-white" htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <Button type="submit" className="w-full">
  {isLoading ? (
    <div>
      <BouncingDotsLoader color="white" />
    </div>
  ) : (
    <div>Login</div>
  )}
</Button>

        </form>
        <div className="mt-4 text-center">
          <Link href="/forgot-password" className="text-blue-600 hover:underline">
            Forgot your password?
          </Link>
        </div>
        <div className="mt-6 text-center">
          Don't have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}