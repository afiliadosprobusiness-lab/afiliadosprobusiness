import "./globals.css"
import Nav from "@/components/Nav"
import { ThemeProvider } from "@/providers/ThemeProvider"
import { LanguageProvider } from "@/context/LanguageContext"
import FloatingControls from "@/components/FloatingControls"

export const metadata = {
  title: "Fast Page",
  description: "Creador y clonador de landing pages"
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <LanguageProvider>
            <Nav />
            {children}
            <FloatingControls />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
