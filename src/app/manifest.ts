import type { MetadataRoute } from "next";

// 홈 화면 추가 / 앱 설치 시 사용되는 웹 앱 매니페스트
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PUF - Physical Unclonable Function",
    short_name: "PUF",
    description: "카메라를 알약에 비추면 성분, 효능, 주의사항을 알려드려요.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3182f6",
    lang: "ko",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
