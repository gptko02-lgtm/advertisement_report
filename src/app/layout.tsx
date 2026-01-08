import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "광고 성과 분석 리포트 생성기",
  description: "광고 데이터를 분석하고 인사이트가 포함된 엑셀 리포트를 자동 생성합니다",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.Node;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
