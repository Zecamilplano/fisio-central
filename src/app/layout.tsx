import type { Metadata } from "next"
import "./globals.css"
import { Montserrat, Open_Sans } from "next/font/google"
import Header from "@/components/header"

export const metadata: Metadata = {
  title: {
    default: "FisioCentral",
    template: "%s | FisioCentral",
  },
  description:
    "Sistema de gestão de pacientes para clínicas e profissionais de fisioterapia.",
}

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
})

const opensans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} ${opensans.variable} antialiased h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1 bg-green-700">{children}</main>
      </body>
    </html>
  )
}
