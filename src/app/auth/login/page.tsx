"use client";

import { useState } from "react";
import { signInWithGoogle, signInWithKakao } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import Loading from "@/components/ui/Loading";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await signInWithKakao();
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  // if (authLoading) {
  //   return <Loading />;
  // }

  if (isAuthenticated) {
    router.push("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">편털</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">환영합니다!</h2>
          <p className="mt-2 text-sm text-gray-600">
            소셜 계정으로 간편하게 시작하세요
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? "로그인 중..." : "구글로 계속하기"}
          </button>

          <button
            onClick={handleKakaoLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-[#FEE500] hover:bg-[#FDD835] rounded-lg shadow-sm text-sm font-medium text-[#191919] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3C6.48 3 2 6.69 2 11.24c0 2.85 1.74 5.36 4.38 6.85-.19.71-.74 2.72-.85 3.14-.14.52.19.53.4.39.16-.11 2.61-1.77 3.67-2.49.45.07.91.11 1.4.11 5.52 0 10-3.69 10-8.24S17.52 3 12 3z"
                fill="#191919"
              />
            </svg>
            {loading ? "로그인 중..." : "카카오로 계속하기"}
          </button>
        </div>

        {/* <div className="text-center text-xs text-gray-500 mt-6">
          로그인하면 편털의{" "}
          <a href="#" className="text-blue-600 hover:underline">
            이용약관
          </a>{" "}
          및{" "}
          <a href="#" className="text-blue-600 hover:underline">
            개인정보처리방침
          </a>
          에 동의하는 것으로 간주됩니다.
        </div> */}
      </div>
    </div>
  );
}
