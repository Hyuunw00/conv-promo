"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import {
  isPushSupported,
  getNotificationPermission,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  saveSubscription,
  deleteSubscription,
} from "@/lib/notifications";

interface NotificationPermissionProps {
  className?: string;
}

export default function NotificationPermission({
  className,
}: NotificationPermissionProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 초기 상태 확인
  useEffect(() => {
    const checkStatus = async () => {
      const supported = isPushSupported();
      setIsSupported(supported);

      if (supported) {
        const currentPermission = getNotificationPermission();
        setPermission(currentPermission);

        // 구독 상태 확인
        if (currentPermission === "granted") {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
        }
      }
    };

    checkStatus();
  }, []);

  // 알림 허용
  const handleEnable = async () => {
    setIsLoading(true);
    console.log("handleEnable");
    try {
      // 1. 권한 요청
      const newPermission = await requestNotificationPermission();
      setPermission(newPermission);

      console.log("newPermission", newPermission); //ok
      if (newPermission !== "granted") {
        toast.error("알림 권한이 거부되었습니다");
        return;
      }

      // 2. 푸시 구독 생성
      const subscription = await subscribeToPush();

      console.log("subscription", subscription); //ok
      // 3. 서버에 저장
      await saveSubscription(subscription);

      console.log("saveSubscription", subscription); //ok

      setIsSubscribed(true);
      toast.success("알림이 활성화되었습니다");
    } catch (error) {
      console.error("Enable notification error:", error);
      toast.error("알림 설정에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  // 알림 비활성화
  const handleDisable = async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // 서버에서 삭제
        await deleteSubscription(subscription);

        // 구독 해제
        await unsubscribeFromPush();
      }

      setIsSubscribed(false);
      toast.success("알림이 비활성화되었습니다");
    } catch (error) {
      console.error("Disable notification error:", error);
      toast.error("알림 해제에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  // 지원하지 않는 브라우저
  if (!isSupported) {
    return (
      <div className={`p-4 bg-gray-100 rounded-lg ${className}`}>
        <div className="flex items-center gap-3 text-gray-600">
          <BellOff className="w-5 h-5" />
          <div>
            <p className="text-sm font-medium">
              알림을 지원하지 않는 브라우저입니다
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Chrome, Edge, Samsung Internet 등에서 사용 가능합니다
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 bg-white rounded-lg border border-gray-200 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              isSubscribed ? "bg-blue-50" : "bg-gray-50"
            }`}
          >
            {isSubscribed ? (
              <Bell className="w-5 h-5 text-blue-600" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-600" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">푸시 알림</p>
            <p className="text-sm text-gray-500">
              {isSubscribed
                ? "새로운 프로모션 알림을 받고 있습니다"
                : "프로모션 알림을 받아보세요"}
            </p>
          </div>
        </div>

        {permission === "granted" ? (
          <button
            onClick={isSubscribed ? handleDisable : handleEnable}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
              isSubscribed
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isLoading ? "처리중..." : isSubscribed ? "비활성화" : "활성화"}
          </button>
        ) : permission === "denied" ? (
          <div className="text-sm text-red-600">권한 거부됨</div>
        ) : (
          <button
            onClick={handleEnable}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "처리중..." : "허용"}
          </button>
        )}
      </div>

      {permission === "denied" && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            브라우저 설정에서 알림 권한을 허용해주세요.
          </p>
        </div>
      )}
    </div>
  );
}
