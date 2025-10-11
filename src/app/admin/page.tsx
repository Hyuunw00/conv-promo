"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Bell, Settings, Shield } from "lucide-react";
import Link from "next/link";
import Loading from "@/components/ui/Loading";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [loading, isAuthenticated, router]);

  // admin 권한 체크
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user?.email) return;

      try {
        const response = await fetch("/api/admin/check");
        const data = await response.json();

        if (!data.isAdmin) {
          router.push("/");
          return;
        }

        setIsAdmin(data.isAdmin);
      } catch (error) {
        console.error("Admin check error:", error);
        router.push("/");
      } finally {
        setChecking(false);
      }
    };

    if (user) {
      checkAdmin();
    }
  }, [user, router]);

  if (loading || checking) {
    return <Loading />;
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/mypage"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">관리자 페이지</h1>
          </div>
        </div>
      </header>

      {/* 관리자 정보 */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">관리자</p>
              <p className="text-xs text-blue-700">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 메뉴 섹션 */}
      <div className="bg-white mt-2">
        <div className="divide-y divide-gray-200">
          {/* 알림 발송 */}
          <div className="px-4 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
            <Link href="/admin/notifications">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Bell className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">알림 발송</p>
                    <p className="text-sm text-gray-500">
                      전체 사용자에게 푸시 알림 보내기
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* 향후 추가될 기능들 */}
          <div className="px-4 py-4 opacity-50 cursor-not-allowed">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Settings className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-500">시스템 설정</p>
                  <p className="text-sm text-gray-400">준비 중</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
