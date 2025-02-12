import type React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onContinueWithoutLogin: () => void
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onContinueWithoutLogin }) => {
  const router = useRouter()

  if (!isOpen) return null

  const handleLogin = () => {
    onClose()
    router.push("/login")
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Login to Save Order Information</h2>
        <p className="mb-6 text-gray-600">
          Logging in allows us to save your order information and provide a better shopping experience.
        </p>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onContinueWithoutLogin}>
            Continue without Login
          </Button>
          <Button onClick={handleLogin}>Login</Button>
        </div>
      </div>
    </div>
  )
}

export default LoginModal

