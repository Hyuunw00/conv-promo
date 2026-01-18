"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Send, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Loading from "@/components/loading";

export default function AdminNotificationsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/");
  const [isSending, setIsSending] = useState(false);

  // 로딩 중
  if (loading) {
    return <Loading />;
  }

  // 로그인 안 됨
  if (!user) {
    router.push("/auth/login");
    return null;
  }

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("제목과 내용을 입력해주세요");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch("/api/notifications/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          url: url.trim() || "/",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "알림 발송 실패");
      }

      toast.success(`알림 발송 완료! (${result.sent}명)`);

      // 폼 초기화
      setTitle("");
      setBody("");
      setUrl("/");
    } catch (error) {
      console.error("Send notification error:", error);
      toast.error(
        error instanceof Error ? error.message : "알림 발송 중 오류 발생"
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">알림 발송</h1>
          </div>
        </div>
      </header>

      {/* 메인 */}
      <main className="px-4 py-6 space-y-6">
        {/* 안내 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            📢 모든 구독자에게 알림이 발송됩니다
          </p>
        </div>

        {/* 폼 */}
        <div className="space-y-4">
          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 🎉 이번 주 신규 프로모션"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/50</p>
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              내용 *
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="예: 1+1 행사 10개 새로 등록되었어요!"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-none"
              maxLength={150}
            />
            <p className="text-xs text-gray-500 mt-1">{body.length}/150</p>
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              클릭 시 이동할 페이지
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="/"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              예: / (홈), /popular (인기), /saved (저장)
            </p>
          </div>
        </div>

        {/* 미리보기 */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">미리보기</h3>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 mb-1">
                  {title || "제목을 입력하세요"}
                </p>
                <p className="text-sm text-gray-600">
                  {body || "내용을 입력하세요"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 발송 버튼 */}
        <button
          onClick={handleSend}
          disabled={isSending || !title.trim() || !body.trim()}
          className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSending ? (
            "발송 중..."
          ) : (
            <>
              <Send className="w-5 h-5" />
              알림 발송하기
            </>
          )}
        </button>
      </main>
    </div>
  );
}
