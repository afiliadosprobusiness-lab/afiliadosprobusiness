import "./globals.css"
import Nav from "@/components/Nav"
import Footer from "@/components/Footer"

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
    <html lang="es">
      <body>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  )
}
