import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import webpush from "web-push";

// VAPID 설정
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:khwland090@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: Request) {
  try {
    const { title, body, url, tag } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: "title과 body는 필수입니다" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 모든 구독자 조회
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("*");

    if (error) {
      console.error("Fetch subscriptions error:", error);
      return NextResponse.json(
        { error: "구독 정보 조회 실패" },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        message: "구독자가 없습니다",
      });
    }

    // 알림 페이로드
    const payload = JSON.stringify({
      title,
      body,
      url: url || "/",
      tag: tag || "broadcast",
    });

    // 모든 구독자에게 알림 전송
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          };

          await webpush.sendNotification(pushSubscription, payload);
          return { success: true, endpoint: sub.endpoint };
        } catch (error: any) {
          console.error("Send notification error:", error);

          // 410 Gone: 구독이 만료됨 -> DB에서 삭제
          if (error.statusCode === 410) {
            await supabase
              .from("push_subscriptions")
              .delete()
              .eq("endpoint", sub.endpoint);
          }

          return {
            success: false,
            endpoint: sub.endpoint,
            error: error.message,
          };
        }
      })
    );

    // 결과 집계
    const successful = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;
    const failed = results.length - successful;

    return NextResponse.json({
      success: true,
      sent: successful,
      failed,
      total: subscriptions.length,
    });
  } catch (error) {
    console.error("Broadcast API error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
