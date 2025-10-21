import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import webpush from "web-push";

// VAPID 설정
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:khwland090@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

interface CrawlerStats {
  new: number;
  updated: number;
  deleted: number;
  unchanged: number;
  total: number;
}

interface CrawlerResults {
  CU?: CrawlerStats;
  SevenEleven?: CrawlerStats;
  GS25?: CrawlerStats;
  Emart24?: CrawlerStats;
}

export async function POST(request: Request) {
  try {
    // 1. 보안 확인 - Webhook Secret 검증
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
      console.error("Unauthorized webhook request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. 크롤링 결과 파싱
    const { results } = (await request.json()) as { results: CrawlerResults };

    if (!results) {
      return NextResponse.json(
        { error: "No results provided" },
        { status: 400 }
      );
    }

    // 3. 프로모션 변경사항 집계
    const brands = ["CU", "SevenEleven", "GS25", "Emart24"] as const;
    let totalNew = 0;
    let totalUpdated = 0;
    let totalDeleted = 0;
    const brandDetails: string[] = [];

    for (const brand of brands) {
      const stats = results[brand];
      if (stats && (stats.new > 0 || stats.updated > 0 || stats.deleted > 0)) {
        totalNew += stats.new;
        totalUpdated += stats.updated;
        totalDeleted += stats.deleted;

        const brandName = brand === "SevenEleven" ? "세븐일레븐" : brand;
        const details: string[] = [];
        if (stats.new > 0) details.push(`신규 ${stats.new}개`);
        if (stats.updated > 0) details.push(`변경 ${stats.updated}개`);
        if (stats.deleted > 0) details.push(`종료 ${stats.deleted}개`);

        if (details.length > 0) {
          brandDetails.push(`${brandName} ${details.join(", ")}`);
        }
      }
    }

    console.log(
      `Crawler webhook received - New: ${totalNew}, Updated: ${totalUpdated}, Deleted: ${totalDeleted}`
    );

    // 4. 변경사항이 없으면 알림 발송 안 함
    if (totalNew === 0 && totalUpdated === 0 && totalDeleted === 0) {
      return NextResponse.json({
        success: true,
        message: "No changes, notification skipped",
        totalNew: 0,
        totalUpdated: 0,
        totalDeleted: 0,
      });
    }

    // 5. 모든 구독자 조회
    const supabase = await createClient();
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("*");

    if (error) {
      console.error("Fetch subscriptions error:", error);
      return NextResponse.json(
        { error: "Failed to fetch subscriptions" },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No subscribers",
        totalNew,
        sent: 0,
      });
    }

    // 6. 알림 메시지 생성
    let title = "🔔 프로모션 업데이트";
    let body = "";

    if (totalNew > 0 && totalUpdated === 0 && totalDeleted === 0) {
      title = "🎉 신규 프로모션 등록!";
      body = `${totalNew}개의 새로운 행사가 추가되었어요!`;
    } else if (totalNew === 0 && totalUpdated > 0 && totalDeleted === 0) {
      title = "✏️ 프로모션 정보 변경";
      body = `${totalUpdated}개의 행사 정보가 변경되었어요!`;
    } else if (totalNew === 0 && totalUpdated === 0 && totalDeleted > 0) {
      title = "⏰ 프로모션 종료";
      body = `${totalDeleted}개의 행사가 종료되었어요!`;
    } else {
      // 여러 변경사항이 섞여 있을 때
      const changes: string[] = [];
      if (totalNew > 0) changes.push(`신규 ${totalNew}개`);
      if (totalUpdated > 0) changes.push(`변경 ${totalUpdated}개`);
      if (totalDeleted > 0) changes.push(`종료 ${totalDeleted}개`);
      body = `${changes.join(", ")} 업데이트!`;
    }

    body += `\n${brandDetails.join(", ")}`;

    const payload = JSON.stringify({
      title,
      body,
      url: "/",
      tag: "crawler-update",
    });

    // 7. 모든 구독자에게 알림 전송
    const results_send = await Promise.allSettled(
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
        } catch (error) {
          console.error("Send notification error:", error);

          // 410 Gone: 구독이 만료됨 -> DB에서 삭제
          if (
            error &&
            typeof error === "object" &&
            "statusCode" in error &&
            error.statusCode === 410
          ) {
            await supabase
              .from("push_subscriptions")
              .delete()
              .eq("endpoint", sub.endpoint);
          }

          return {
            success: false,
            endpoint: sub.endpoint,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
    );

    // 8. 결과 집계
    const successful = results_send.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;
    const failed = results_send.length - successful;

    console.log(
      `Notification sent - Success: ${successful}, Failed: ${failed}`
    );

    return NextResponse.json({
      success: true,
      totalNew,
      sent: successful,
      failed,
      total: subscriptions.length,
    });
  } catch (error) {
    console.error("Webhook API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
