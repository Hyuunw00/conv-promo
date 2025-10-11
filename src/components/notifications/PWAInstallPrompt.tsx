"use client";

import { useState, useEffect } from "react";
import { X, Bell } from "lucide-react";
import { toast } from "sonner";
import {
  isPushSupported,
  getNotificationPermission,
  requestNotificationPermission,
  subscribeToPush,
  saveSubscription,
} from "@/lib/notifications";

/**
 * PWA 설치 후 알림 권한 요청 모달
 */
export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  console.log("showPrompt", showPrompt);

  useEffect(() => {
    // PWA 설치 감지
    const handleAppInstalled = () => {
      console.log("PWA installed!");

      // 이미 알림 권한이 있는지 확인
      const permission = getNotificationPermission();
      console.log("permission", permission);
      // 권한이 없고, 지원되는 브라우저면 프롬프트 표시
      if (permission === "default" && isPushSupported()) {
        // 설치 직후 약간의 딜레이 (UX 개선)
        setTimeout(() => {
          setShowPrompt(true);
        }, 2000);
      }
    };

    // PWA 설치 이벤트 리스너
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // 알림 허용
  const handleAllow = async () => {
    setIsLoading(true);
    try {
      // 권한 요청
      const permission = await requestNotificationPermission();

      if (permission !== "granted") {
        toast.error("알림 권한이 거부되었습니다");
        setShowPrompt(false);
        return;
      }

      // 푸시 구독 생성
      const subscription = await subscribeToPush();

      // 서버에 저장
      await saveSubscription(subscription);

      toast.success("알림이 활성화되었습니다");
      setShowPrompt(false);
    } catch (error) {
      console.error("Enable notification error:", error);
      toast.error("알림 설정에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  // 나중에
  const handleLater = () => {
    setShowPrompt(false);
    toast.info("마이페이지에서 언제든지 설정할 수 있어요");
  };

  if (!showPrompt) return null;

  return (
    <>
      {/* 오버레이 */}
      <div className="fixed inset-0 z-[70] bg-black/40" />

      {/* 모달 */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[90%] max-w-sm bg-white rounded-3xl shadow-2xl p-6">
        {/* 닫기 버튼 */}
        <button
          onClick={handleLater}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* 아이콘 */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Bell className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* 제목 */}
        <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
          알림을 받아보세요!
        </h2>

        {/* 설명 */}
        <p className="text-center text-gray-600 mb-6 leading-relaxed">
          새로운 프로모션과 특가 정보를
          <br />
          실시간으로 알려드릴게요
        </p>

        {/* 버튼들 */}
        <div className="space-y-3">
          <button
            onClick={handleAllow}
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "설정 중..." : "알림 받기"}
          </button>
          <button
            onClick={handleLater}
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            나중에
          </button>
        </div>

        {/* 안내 문구 */}
        <p className="text-xs text-gray-500 text-center mt-4">
          마이페이지에서 언제든지 변경할 수 있어요
        </p>
      </div>
    </>
  );
}
