import type { Metadata } from "next"
import "./globals.css"
import { Montserrat, Open_Sans } from "next/font/google"
import Header from "@/components/ui/header"
import { ToastContainer } from "react-toastify"

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
    <html lang="pt-br">
      <body
        className={`${montserrat.variable} ${opensans.variable} antialiased flex min-h-dvh flex-col bg-green-700`}
      >
        <Header />
        {/* ocupa o espaço abaixo do header; a rolagem é a do próprio body.
            (antes era 100% da tela + header, o que sobrava como faixa verde) */}
        {/* overflow-x-clip: rede de segurança — se algo passar da largura da
            tela, não cria rolagem lateral nem deixa o header "curto" */}
        <main className="flex min-w-0 flex-1 flex-col overflow-x-clip bg-green-700">{children}</main>
        <ToastContainer style={{ zIndex: 10000 }} />
      </body>
    </html>
  )
}
