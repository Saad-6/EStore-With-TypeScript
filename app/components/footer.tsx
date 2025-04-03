"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon, MessageSquare, Loader2 } from "lucide-react"

interface LinkDTO {
  id: number
  name: string
  url: string
  linkType: string
  displayOrder: number
}

interface IconEntity {
  id: number
  platform: string
  linkUrl: string
  isActive: boolean
  displayOrder: number
  footerId: number
}

interface FooterDTO {
  id: number
  customerServiceLinks: LinkDTO[]
  quickLinks: LinkDTO[]
  aboutUs: string
  icons: IconEntity[]
}

const Footer = () => {
  const [footerData, setFooterData] = useState<FooterDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const response = await fetch("https://localhost:7007/api/Footer")

        if (!response.ok) {
          throw new Error("Failed to fetch footer data")
        }

        const data = await response.json()
        setFooterData(data)
      } catch (err) {
        console.error("Error fetching footer data:", err)
        setError("Failed to load footer content. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFooterData()
  }, [])

  // Sort links by display order
  const sortByDisplayOrder = (links: LinkDTO[]) => {
    return [...links].sort((a, b) => a.displayOrder - b.displayOrder)
  }

  // Sort icons by display order and filter active ones
  const getActiveIcons = () => {
    if (!footerData?.icons) return []
    return footerData.icons.filter((icon) => icon.isActive).sort((a, b) => a.displayOrder - b.displayOrder)
  }

  // Get the appropriate icon component based on platform name
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "facebook":
        return <FacebookIcon size={24} />
      case "x":
      case "twitter":
        return <TwitterIcon size={24} />
      case "instagram":
        return <InstagramIcon size={24} />
      case "linkedin":
        return <LinkedinIcon size={24} />
      case "whatsapp":
        return <MessageSquare size={24} />
      default:
        return <FacebookIcon size={24} />
    }
  }

  // If still loading, show a loading spinner
  if (isLoading) {
    return (
      <footer className="bg-gray-900 text-white py-12 dark:bg-gray-800">
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </footer>
    )
  }

  // If there was an error or no data, show a minimal footer
  if (error || !footerData) {
    return (
      <footer className="bg-gray-900 text-white py-12 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400">&copy; {new Date().getFullYear()} EStore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    )
  }

  // Sort and prepare the links and icons
  const sortedQuickLinks = sortByDisplayOrder(footerData.quickLinks || [])
  const sortedCustomerServiceLinks = sortByDisplayOrder(footerData.customerServiceLinks || [])
  const activeIcons = getActiveIcons()

  return (
    <footer className="bg-gray-900 text-white py-12 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Us Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <p className="text-gray-400">{footerData.aboutUs}</p>
          </div>

          {/* Quick Links Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {sortedQuickLinks.map((link) => (
                <motion.li key={link.id} whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                  <a href={link.url} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Customer Service Links Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              {sortedCustomerServiceLinks.map((link) => (
                <motion.li key={link.id} whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                  <a href={link.url} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Social Media Icons Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              {activeIcons.map((icon) => (
                <motion.a
                  key={icon.id}
                  href={icon.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {getSocialIcon(icon.platform)}
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400">&copy; {new Date().getFullYear()} EStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

