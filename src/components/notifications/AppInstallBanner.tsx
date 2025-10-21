"use client";

import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * PWA 설치 제안 배너
 */
export default function AppInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // iOS 감지
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    // 이미 설치되었는지 확인
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      return; // 이미 설치된 경우 프롬프트 표시 안 함
    }

    // 이전에 닫은 적이 있는지 확인 (24시간 동안 다시 표시 안 함)
    const dismissedAt = localStorage.getItem("installPromptDismissedAt");
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) {
        return;
      }
    }

    // Android/Desktop: beforeinstallprompt 이벤트 처리
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // 약간의 딜레이 후 프롬프트 표시 (UX 개선)
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // iOS: 안내 표시 (24시간 제한 이미 체크됨)
    if (ios) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt && !isIOS) {
      return;
    }

    if (deferredPrompt) {
      // Android/Desktop: 설치 프롬프트 표시
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("installPromptDismissedAt", Date.now().toString());
  };

  if (!showPrompt) return null;

  // iOS 안내
  if (isIOS) {
    return (
      <>
        {/* 오버레이 */}
        <div className="fixed inset-0 z-[70] bg-black/40" onClick={handleDismiss} />

        {/* 모달 */}
        <div className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl shadow-2xl p-6 animate-slide-up">
          {/* 닫기 버튼 */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          {/* 아이콘 */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          {/* 제목 */}
          <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
            홈 화면에 추가하기
          </h2>

          {/* 설명 */}
          <div className="text-sm text-gray-600 space-y-2 mb-6">
            <p className="text-center font-medium">
              편털을 앱처럼 사용해보세요!
            </p>
            <ol className="list-decimal list-inside space-y-1 text-left bg-gray-50 rounded-xl p-4">
              <li>
                하단의 <span className="font-semibold">공유 버튼</span>을 탭하세요
              </li>
              <li>
                <span className="font-semibold">&quot;홈 화면에 추가&quot;</span>를
                선택하세요
              </li>
              <li>오른쪽 상단의 &quot;추가&quot;를 탭하세요</li>
            </ol>
          </div>

          {/* 버튼 */}
          <button
            onClick={handleDismiss}
            className="w-full py-3.5 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            확인
          </button>
        </div>
      </>
    );
  }

  // Android/Desktop
  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 animate-slide-up">
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Download className="w-6 h-6 text-blue-600" />
        </div>

        {/* 내용 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 mb-1">앱으로 설치하기</h3>
          <p className="text-sm text-gray-600">
            편털을 앱처럼 빠르고 편리하게 사용하세요
          </p>
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          aria-label="닫기"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* 버튼들 */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleInstall}
          className="flex-1 py-2.5 px-4 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          설치하기
        </button>
        <button
          onClick={handleDismiss}
          className="px-4 py-2.5 text-sm text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
        >
          나중에
        </button>
      </div>
    </div>
  );
}
