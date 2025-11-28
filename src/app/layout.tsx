import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google"; // localFont 대신 google 폰트 사용
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import Header from "@/components/Header";

// 로컬 폰트 파일이 없으므로 Google Fonts로 대체합니다.
// 기존 CSS 변수(--font-geist-sans 등)를 그대로 사용하여 스타일을 유지합니다.
const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SenaGM Client",
  description: "Seven Knights Guild Manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* AuthProvider가 유저 정보를 가져옴 */}
        <AuthProvider>

          {/* 2. 여기에 Header를 넣어야 모든 페이지 상단에 뜹니다! */}
          <Header />

          {children}
        </AuthProvider>
      </body>
    </html>
  );
}