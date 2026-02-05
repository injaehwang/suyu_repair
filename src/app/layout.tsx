import type { Metadata } from "next";
import { Outfit } from "next/font/google"; // Using Outfit as per guidelines
import Script from "next/script";
import "./globals.css";
import Providers from "./providers";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { FloatingButton } from "@/components/common/FloatingButton";
import AnnouncementModal from "@/components/announcement-modal";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "suyu repair - 비대면 의류 수선 서비스",
  description: "모바일로 간편하게 옷 수선을 맡겨보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={outfit.className}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <FloatingButton />
            <Footer />
            <AnnouncementModal />
          </div>
        </Providers>
        <Script
          src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
