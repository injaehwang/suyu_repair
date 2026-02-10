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
    default: "수유수선 (Suyu Repair) - 전국 비대면 의류 수선 & 리폼 택배 서비스",
    template: "%s | 수유수선 - 전국 어디서나 비대면 옷수선",
  },
  description: "전국 어디서나 모바일로 간편하게! 가죽자켓, 코트, 패딩, 명품 의류 수선 및 리폼. 문 앞 수거부터 배송까지 비대면 택배 수선 서비스를 제공합니다.",
  keywords: ["전국 택배 수선", "비대면 옷수선", "온라인 수선", "가죽자켓 수선", "명품 수선", "패딩 수선", "전국 수선 택배", "강북 수유수선", "옷 리폼"],
  openGraph: {
    title: "수유수선 - 전국 비대면 의류 수선 & 리폼 택배 서비스",
    description: "전국 어디서나 집에서 편하게. 가죽자켓, 코트, 패딩, 명품 등 모든 의류 전문 수선. 문 앞 수거/배송 서비스.",
    url: "https://suyu.ai.kr",
    siteName: "수유수선 (Suyu Repair) - 전국 서비스",
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
