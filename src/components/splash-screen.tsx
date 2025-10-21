"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * 앱 첫 로드 시 스플래시 스크린
 */
export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 스플래시 스크린 표시 시간 (1.5초)
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-blue-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto flex flex-col items-center justify-center px-4">
        {/* 로고/아이콘 */}
        <div className="relative w-32 h-32 mb-6 animate-scale-in">
          <Image
            src="/icon-512.png"
            alt="편털"
            fill
            className="object-contain rounded-3xl shadow-2xl"
            priority
          />
        </div>

        {/* 앱 이름 */}
        <h1 className="text-4xl font-bold text-gray-900 mb-2 animate-slide-up">
          편털
        </h1>

        {/* 서브 타이틀 */}
        <p className="text-gray-600 text-sm animate-slide-up animation-delay-100">
          편의점 행사 모아보기
        </p>

        {/* 로딩 인디케이터 */}
        <div className="mt-12 animate-slide-up animation-delay-200">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce animation-delay-0"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce animation-delay-100"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce animation-delay-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
