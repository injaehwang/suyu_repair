import type { Metadata } from "next";
import { Outfit } from "next/font/google"; // Using Outfit as per guidelines
import Script from "next/script";
import "./globals.css";
import Providers from "./providers";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { FloatingButton } from "@/components/common/FloatingButton";
import AnnouncementModal from "@/components/announcement-modal";
import StructuredData from "@/components/StructuredData";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://suyu.ai.kr'),
  title: {
    default: "수유수선 (Suyu Repair) - 전문 옷수선 & 리폼",
    template: "%s | 수유수선 (Suyu Repair) - 전문 옷수선 & 리폼",
  },
  description: "수유수선은 가죽자켓, 코트, 청바지 등 모든 의류의 전문 수선 및 리폼 서비스를 제공합니다. 방문 수거 및 택배 서비스 가능.",
  keywords: ["수선", "옷수선", "가죽자켓 수선", "바지 기장 수선", "옷 리폼", "수유동 수선집", "강북구 수선", "청바지 수선", "명품 수선", "코트 수선", "패딩 수선", "지퍼 수선"],
  openGraph: {
    title: "수유수선 (Suyu Repair) - 전문 옷수선 & 리폼",
    description: "수유수선은 가죽자켓, 코트, 청바지 등 모든 의류의 전문 수선 및 리폼 서비스를 제공합니다.",
    url: "https://suyu.ai.kr",
    siteName: "수유수선 (Suyu Repair)",
    locale: "ko_KR",
    type: "website",
  },
  verification: {
    google: "google-site-verification-code", // Placeholder, waiting for user
    other: {
      "naver-site-verification": "ff7ac0873f7725c5328df0921370665b9831b065",
    },
  },
};

export const dynamic = 'force-dynamic';

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
        <StructuredData />
      </body>
    </html>
  );
}
