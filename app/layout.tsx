import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/smooth-scroll";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/context/language-context";
import { Preloader } from "@/components/preloader";
import { CustomCursor } from "@/components/custom-cursor";
import Navbar from "@/components/navbar";
import { APP_CONFIG } from "@/lib/constants";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: APP_CONFIG.NAME,
  description: APP_CONFIG.DESC,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${syne.variable} font-sans bg-background text-foreground antialiased`}>
        <LanguageProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
          >
            <CustomCursor />
            <Preloader />
            <SmoothScroll>
              <Navbar />
              {children}
            </SmoothScroll>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
