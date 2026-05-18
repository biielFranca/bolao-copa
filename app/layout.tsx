import type { Metadata } from "next";
import { Anton, Manrope } from "next/font/google";
import "./globals.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "Bolão da Copa — Lau Burguer",
  description: "Faça seus palpites e concorra no bolão da Copa do Mundo da Lau Burguer!",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${anton.variable} ${manrope.variable}`}>
      <body style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#fff8e6', fontFamily: 'var(--font-manrope), sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
