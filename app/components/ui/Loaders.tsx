import React from 'react'
import { Loader2 } from 'lucide-react'

// Spinning Circle Loader
export const SpinningCircleLoader = () => (
  <div className="flex justify-center items-center h-24">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
)

// Shaky Blurry Loader
export const ShakyBlurryLoader = () => (
  <div className="relative flex justify-center items-center h-24 overflow-hidden">
    <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm animate-shake"></div>
    <div className="z-10 text-lg font-bold text-primary animate-pulse">Loading...</div>
  </div>
)
interface BouncingDotsLoaderProps {
    color: string | null;
  }
// Surprise Loader: Bouncing Dots
export const BouncingDotsLoader = ({ color }: BouncingDotsLoaderProps) => (
  <div className="flex justify-center items-center h-24 space-x-2">
    {[0, 1, 2].map((index) => (
      <div
        key={index}
        className={`w-4 h-4 bg-${color ?? 'primary'} dark:bg-primary rounded-full animate-bounce`}

        style={{ animationDelay: `${index * 0.1}s` }}
      ></div>
    ))}
  </div>
)

