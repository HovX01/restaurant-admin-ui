import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/auth.context';
import { PageLoadingProvider } from '@/contexts/page-loading.context';
import { PageLoadingIndicator } from '@/components/ui/page-loading-indicator';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Restaurant Admin Panel",
  description: "Complete restaurant management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <PageLoadingProvider>
            <PageLoadingIndicator />
            {children}
            <Toaster 
              position="top-right"
              richColors
              closeButton
              duration={4000}
            />
          </PageLoadingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
