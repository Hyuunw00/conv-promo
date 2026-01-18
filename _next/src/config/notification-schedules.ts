/**
 * 알림 스케줄 설정
 * 🎯 여기에만 추가하면 자동으로 작동!
 */

export interface NotificationSchedule {
  type: string;
  title: string;
  body: string | ((date: Date) => string); // 동적 생성 가능
  url?: string;
  // 조건 (하나만 설정)
  day?: number; // 매달 N일
  weekday?: number; // 매주 N요일 (0=일요일, 5=금요일)
  dayBeforeMonthEnd?: boolean; // 매달 마지막날 하루 전
}

export const NOTIFICATION_SCHEDULES: NotificationSchedule[] = [
  // 매달 1일 - 월간 프로모션 시작
  {
    type: "monthly_start",
    title: "🎉 이달의 편의점 프로모션 업데이트!",
    body: (date: Date) =>
      `${date.getFullYear()}년 ${
        date.getMonth() + 1
      }월 신규 프로모션이 업데이트되었습니다!\n최신 1+1, 2+1 행사를 확인해보세요 🛒`,
    url: "/",
    day: 1,
  },

  // 매달 마지막날 하루 전 - 행사 종료 알림
  {
    type: "monthly_ending",
    title: "⏰ 이달의 행사가 곧 종료됩니다!",
    body: (date: Date) =>
      `${
        date.getMonth() + 1
      }월 행사가 내일 종료됩니다!\n놓치지 마시고 지금 확인하세요 🏃‍♂️`,
    url: "/",
    dayBeforeMonthEnd: true,
  },

  // 🆕 새 알림 추가 예시:
  //
  // 매달 15일 - 월중 특가
  // {
  //   type: "monthly_15th",
  //   title: "💝 월중 특가 알림!",
  //   body: "월중 특가 프로모션이 업데이트되었습니다!",
  //   url: "/popular",
  //   day: 15,
  // },
  //
  // 매주 금요일 - 주간 인기
  // {
  //   type: "weekly_friday",
  //   title: "🔥 이번 주 인기 프로모션!",
  //   body: "이번 주 가장 인기있는 1+1, 2+1 행사를 확인해보세요!",
  //   url: "/popular",
  //   weekday: 5,
  // },
];

/**
 * 달의 마지막날 하루 전인지 확인
 */
function isDayBeforeMonthEnd(date: Date): boolean {
  const tomorrow = new Date(date);
  tomorrow.setDate(date.getDate() + 1);

  const dayAfterTomorrow = new Date(date);
  dayAfterTomorrow.setDate(date.getDate() + 2);

  // 모레가 다음 달 1일이면 오늘은 마지막날 - 1일
  return (
    dayAfterTomorrow.getDate() === 1 &&
    dayAfterTomorrow.getMonth() !== date.getMonth()
  );
}

/**
 * 현재 날짜/요일에 맞는 알림 찾기
 */
export function findScheduleForDate(date: Date): NotificationSchedule | null {
  const day = date.getDate();
  const weekday = date.getDay();

  return (
    NOTIFICATION_SCHEDULES.find((schedule) => {
      if (schedule.day !== undefined && schedule.day === day) return true;
      if (schedule.weekday !== undefined && schedule.weekday === weekday)
        return true;
      if (schedule.dayBeforeMonthEnd && isDayBeforeMonthEnd(date)) return true;
      return false;
    }) || null
  );
}
