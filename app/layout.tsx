import Footer from './components/footer'
import Navbar from './components/navbar'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'EStore - Your Online Shop',
  description: 'Welcome to EStore, your one-stop shop for all your needs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
       <Navbar />
        {children}

        <Footer/>
        </body>
    </html>
  )
}