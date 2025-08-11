import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import QuestionGenerator from "@/components/QuestionGenerator";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "iPAS資安檢定刷題網站",
  description: "練習iPAS資訊安全檢定(中級)題目",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <header className="bg-blue-600 text-white shadow-md">
            <div className="container mx-auto px-4 py-4">
              <div className="flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold">iPAS資安檢定刷題</Link>
                <nav className="space-x-4">
                  <Link href="/" className="hover:underline">首頁</Link>
                  <Link href="/practice/technical" className="hover:underline">技術題</Link>
                  <Link href="/practice/management" className="hover:underline">管理題</Link>
                  <Link href="/history" className="hover:underline">歷史記錄</Link>
                  <Link href="/about" className="hover:underline">關於</Link>
                </nav>
              </div>
            </div>
          </header>
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="bg-gray-100 py-4">
            <div className="container mx-auto px-4 text-center text-gray-600">
              © {new Date().getFullYear()} iPAS資安檢定刷題網站 - 使用Next.js開發
            </div>
          </footer>
        </div>
        <QuestionGenerator />
      </body>
    </html>
  );
}
