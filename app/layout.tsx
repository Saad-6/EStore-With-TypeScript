import './globals.css'
import { AuthProvider } from './lib/auth'
import RootLayoutContent from './components/root-layout-content'
import { ThemeProvider } from './lib/theme-context'
import { FontProvider } from './lib/FontProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
    <body>
      <AuthProvider>
        <ThemeProvider>
          <FontProvider>
          <RootLayoutContent>{children}</RootLayoutContent>
          </FontProvider>
        </ThemeProvider>
      </AuthProvider>
    </body>
  </html>
  )
}