import './globals.css'
import { AuthProvider } from './lib/auth'
import RootLayoutContent from './components/root-layout-content'
import { ThemeProvider } from './lib/theme-context'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
    <body>
      <AuthProvider>
        <ThemeProvider>
          <RootLayoutContent>{children}</RootLayoutContent>
        </ThemeProvider>
      </AuthProvider>
    </body>
  </html>
  )
}