import type { Metadata } from "next"
import { Figtree, Syne } from "next/font/google"
import "./globals.css"

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
})

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Deccum — Retirement spending simulator",
  description:
    "Map a year-by-year withdrawal sequence across 401(k), Roth, brokerage, and pension accounts while navigating RMDs, ACA cliffs, and IRMAA brackets.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${syne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  )
}
