"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { signOut, deleteAccount } from "@/lib/auth";
import { toast } from "sonner";
import Loading from "@/components/ui/Loading";
import NotificationPermission from "@/components/notifications/NotificationPermission";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  Info,
  User,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

export default function MyPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [loading, isAuthenticated, router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    const { error } = await signOut();
    if (!error) {
      router.push("/");
    }
    setLoggingOut(false);
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "정말로 탈퇴하시겠습니까?\n탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다."
      )
    ) {
      return;
    }

    const { error } = await deleteAccount();
    if (error) {
      toast.error("회원 탈퇴에 실패했습니다");
    } else {
      toast.success("회원 탈퇴가 완료되었습니다");
      router.push("/");
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return null; // useRequireAuth가 리다이렉트 처리
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">마이페이지</h1>
          </div>
        </div>
      </header>

      {/* 프로필 섹션 */}
      <div className="bg-white mt-2">
        <div className="px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden">
              {user.user_metadata.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    if (e.currentTarget.parentElement) {
                      e.currentTarget.parentElement.innerHTML = `<div class="flex items-center justify-center w-full h-full"><svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>`;
                    }
                  }}
                />
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-lg font-medium">{user.email}</p>
              <p className="text-sm text-gray-500">{user.user_metadata.name}</p>
              <p className="text-sm text-gray-500">
                가입일: {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 메뉴 섹션 */}
      <div className="bg-white mt-2">
        <div className="divide-y divide-gray-200">
          <button
            onClick={() => router.push("/saved")}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">저장한 프로모션</span>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 rotate-180" />
          </button>
        </div>
      </div>

      {/* 서비스 정보 섹션 */}
      <div className="bg-white mt-2">
        <div className="divide-y divide-gray-200">
          <a
            href="https://github.com/Hyuunw00/conv-promo"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">서비스 정보</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">v1.0.0</span>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </div>
          </a>
        </div>
      </div>

      {/* 로그아웃 버튼 */}
      <div className="px-4 mt-6">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full py-3 text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {loggingOut ? "로그아웃 중..." : "로그아웃"}
        </button>
      </div>

      {/* 알림 설정 섹션 */}
      <div className="px-4 mt-4">
        <NotificationPermission />
      </div>

      {/* 회원 탈퇴 버튼 */}
      <div className="px-4 mt-2 pb-4">
        <button
          onClick={handleDeleteAccount}
          className="text-xs text-gray-400 underline hover:text-gray-600 transition-colors"
        >
          회원 탈퇴
        </button>
      </div>
    </div>
  );
}
