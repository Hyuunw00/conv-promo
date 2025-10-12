import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import webpush from "web-push";
import { findScheduleForDate } from "@/config/notification-schedules";

// VAPID 설정
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:khwland090@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: Request) {
  try {
    // 1. 보안 확인
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.WEBHOOK_SECRET;

    if (!expectedToken) {
      console.error("WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }

    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      console.error("Unauthorized request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. 트리거 타입 확인
    const body = await request.json().catch(() => ({}));
    const trigger = body.trigger; // "schedule" 또는 "workflow_dispatch"

    // KST 기준 현재 날짜 (명확하게)
    const kstDate = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" })
    );
    const day = kstDate.getDate();
    const utcDay = new Date().getDate();

    console.log(
      `Current time - KST Day: ${day}, UTC Day: ${utcDay}, Trigger: ${trigger}`
    );

    // 알림 타입 결정
    let notificationType: string;
    let notificationTitle: string;
    let notificationBody: string;
    let notificationUrl: string;

    if (trigger === "schedule") {
      // Cron 자동 실행: Config에서 스케줄 찾기
      const schedule = findScheduleForDate(kstDate);

      if (!schedule) {
        // 설정된 알림이 없으면 스킵
        console.log(
          `[Cron] Skipped: No notification scheduled for ${
            kstDate.toISOString().split("T")[0]
          }`
        );
        return NextResponse.json({
          success: true,
          message: `No notification scheduled for today`,
          skipped: true,
        });
      }

      // Config에서 알림 정보 가져오기
      notificationType = schedule.type;
      notificationTitle = schedule.title;
      notificationBody =
        typeof schedule.body === "function"
          ? schedule.body(kstDate)
          : schedule.body;
      notificationUrl = schedule.url || "/";

      console.log(
        `[Cron] ${notificationType} notification triggered (${
          kstDate.toISOString().split("T")[0]
        })`
      );
    } else {
      // 수동 실행: 테스트 알림 (날짜 체크 없이)
      const weekday = kstDate.getDay();
      notificationType = "manual_test";
      notificationTitle = "🧪 테스트 알림";
      notificationBody = `테스트 알림입니다.\n시간: ${kstDate.toLocaleString(
        "ko-KR",
        { timeZone: "Asia/Seoul" }
      )}\n날짜: ${day}일, 요일: ${
        ["일", "월", "화", "수", "목", "금", "토"][weekday]
      }요일`;
      notificationUrl = "/";
      console.log(`[Manual] Test notification triggered (Day ${day} KST)`);
    }

    // 3. 모든 구독자 조회
    const supabase = await createClient();
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("*");

    if (error) {
      console.error("Fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch subscriptions" },
        { status: 500 }
      );
    }

    if (!subscriptions?.length) {
      return NextResponse.json({
        success: true,
        message: "No subscribers",
        sent: 0,
      });
    }

    console.log(`Found ${subscriptions.length} subscribers`);

    // 4. 알림 메시지 생성 (Config에서 가져온 내용 사용)
    const payload = JSON.stringify({
      title: notificationTitle,
      body: notificationBody,
      url: notificationUrl,
      tag: notificationType,
    });

    // 6. 모든 구독자에게 알림 전송
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload
          );
          return { success: true };
        } catch (error: any) {
          console.error("Send error:", error);

          // 410 Gone: 구독 만료 -> DB에서 삭제
          if (error?.statusCode === 410) {
            await supabase
              .from("push_subscriptions")
              .delete()
              .eq("endpoint", sub.endpoint);
          }
          return { success: false };
        }
      })
    );

    // 7. 결과 집계
    const successful = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;

    console.log(
      `[${notificationType}] Notification sent - Success: ${successful}/${subscriptions.length}`
    );

    return NextResponse.json({
      success: true,
      type: notificationType,
      trigger: trigger || "unknown",
      sent: successful,
      failed: results.length - successful,
      total: subscriptions.length,
      title: notificationTitle,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
