import type { Metadata } from "next";
import { Orbitron, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({ 
  subsets: ["latin"], 
  variable: "--font-orbitron",
  weight: ["400", "500", "600", "700", "800", "900"]
});
const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"], 
  variable: "--font-space",
  weight: ["300", "400", "500", "600", "700"]
});
const jetbrains = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-mono" 
});

export const metadata: Metadata = {
  title: "ThreatLens | Continuous Security Validation",
  description: "Autonomous Security Engineering Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable} ${orbitron.variable} ${jetbrains.variable} font-sans bg-cyber-bg text-cyber-blue antialiased min-h-screen selection:bg-cyber-blue/30 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}

