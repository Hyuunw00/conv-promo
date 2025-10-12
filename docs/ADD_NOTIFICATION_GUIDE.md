# 📬 알림 추가 가이드

> 새로운 정기 알림을 추가하는 방법을 단계별로 설명합니다.

---

## 🎯 현재 알림 현황

| 알림 타입 | 실행 시간                        | 내용                     |
| --------- | -------------------------------- | ------------------------ |
| 월간 시작 | 매달 1일 오전 11시 (KST)         | 이달의 프로모션 업데이트 |
| 월간 종료 | 매달 마지막날 하루 전 11시 (KST) | 행사 종료 알림           |

---

## ✨ 새 알림 추가하기

### **핵심: Config 파일에만 추가하면 끝!** 🎉

---

### **Step 1: Config 파일에 알림 추가** ⭐

📁 `src/config/notification-schedules.ts` 파일을 열고 `NOTIFICATION_SCHEDULES` 배열에 추가:

```typescript
export const NOTIFICATION_SCHEDULES: NotificationSchedule[] = [
  // 매달 1일
  {
    type: "monthly_start",
    title: "🎉 이달의 편의점 프로모션 업데이트!",
    body: (date: Date) => `...`,
    url: "/",
    day: 1,
  },

  // 매달 마지막날 하루 전
  {
    type: "monthly_ending",
    title: "⏰ 이달의 행사가 곧 종료됩니다!",
    body: (date: Date) => `...`,
    url: "/",
    dayBeforeMonthEnd: true,
  },

  // 🆕 매달 15일 알림 추가 예시
  {
    type: "monthly_15th",
    title: "💝 월중 특가 알림!",
    body: "월중 특가 프로모션이 업데이트되었습니다!",
    url: "/popular",
    day: 15,
  },
];
```

**필드 설명:**

- `type`: 알림 고유 ID (영문, 중복 불가)
- `title`: 알림 제목
- `body`: 알림 내용 (문자열 또는 함수)
  - 함수 사용 시 동적으로 날짜/시간 포함 가능
- `url`: 클릭 시 이동할 페이지 (선택, 기본값: `/`)
- **조건 (하나만 선택):**
  - `day: N` - 매달 N일
  - `weekday: N` - 매주 N요일 (0=일요일, 5=금요일)
  - `dayBeforeMonthEnd: true` - 매달 마지막날 하루 전

---

### **Step 2: yaml에 스케줄 추가** (필요시)

**대부분의 경우 Step 1만으로 충분!**

매달 1일, 15일처럼 **고정 날짜**는 yaml에 추가:

📁 `.github/workflows/scheduled-notifications.yml`:

```yaml
schedule:
  - cron: "0 2 1 * *" # 매달 1일
  - cron: "0 2 28-30 * *" # 마지막날 하루 전
  - cron: "0 5 15 * *" # 🆕 매달 15일 14시
```

**Cron 표현식:**

```
┌───────────── 분 (0-59)
│ ┌───────────── 시 (0-23, UTC!)
│ │ ┌───────────── 일 (1-31)
│ │ │ ┌───────────── 월 (1-12)
│ │ │ │ ┌───────────── 요일 (0-7)
│ │ │ │ │
* * * * *
```

**시간 변환 (KST → UTC):**

- KST 11시 = UTC 2시 → `0 2 * * *`
- KST 14시 = UTC 5시 → `0 5 * * *`
- KST 20시 = UTC 11시 → `0 11 * * *`

---

## 📝 알림 추가 예시

### **예시 1: 매달 25일 "월급날 특가"**

#### Config 파일만 수정:

```typescript
{
  type: "payday",
  title: "💰 월급날 특가!",
  body: "월급날 맞이 특별 프로모션을 확인하세요!",
  url: "/",
  day: 25,
}
```

#### yaml (선택):

```yaml
- cron: "0 0 25 * *" # 매달 25일 9시
```

**끝!** 🎉

---

### **예시 2: 매주 금요일 "주간 인기"**

#### Config 파일만 수정:

```typescript
{
  type: "weekly_friday",
  title: "🔥 이번 주 인기 프로모션!",
  body: "이번 주 가장 인기있는 1+1, 2+1 행사를 확인해보세요!",
  url: "/popular",
  weekday: 5,  // 0=일요일, 5=금요일
}
```

#### yaml (선택):

```yaml
- cron: "0 1 * * 5" # 매주 금요일 10시
```

---

### **예시 3: 동적 메시지 (날짜 포함)**

```typescript
{
  type: "monthly_15th",
  title: "💝 월중 특가!",
  body: (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일 기준 특가 프로모션을 확인하세요!`;
  },
  url: "/popular",
  day: 15,
}
```

---

## 🎨 알림 커스터마이징

### **추천 이모지:**

- 🎉 🎊 - 축하, 업데이트
- 🔥 💥 - 인기, 핫딜
- 💰 💵 - 할인, 특가
- ⏰ ⏳ - 마감임박
- 🎁 🎀 - 선물, 이벤트
- 🛒 🛍️ - 쇼핑

### **URL 옵션:**

- `/` - 홈 (전체 프로모션)
- `/popular` - 인기 프로모션
- `/?sort=end_date` - 종료 임박순

---

## 🧪 **테스트 방법**

### **GitHub에서 수동 실행:**

1. **Actions** 탭 이동
2. **"Scheduled Notifications"** 선택
3. **"Run workflow"** 클릭
4. 즉시 테스트 알림 발송! (날짜 무관)

**테스트 알림:**

```
🧪 테스트 알림
테스트 알림입니다.
시간: 2025. 10. 20. 오후 3:42:15
날짜: 20일, 요일: 일요일
```

---

## ⚙️ **시스템 동작 원리**

### **1. Cron이 워크플로우 실행**

```yaml
- cron: "0 2 1 * *" # 매달 1일 2시(UTC)
```

### **2. API가 Config 확인**

```typescript
const schedule = findScheduleForDate(kstDate);
// → Config에서 오늘 날짜에 맞는 알림 찾기
```

### **3. 알림 발송 또는 스킵**

- 설정된 알림 있음 → 발송
- 설정된 알림 없음 → 스킵

---

## 🔧 **알림 수정/삭제**

### **알림 내용 수정:**

Config 파일에서 `title`, `body`만 수정 후 배포

### **알림 일시 중지:**

Config에서 주석 처리:

```typescript
// {
//   type: "weekly_friday",
//   ...
// },
```

### **알림 완전 삭제:**

1. Config에서 제거
2. yaml에서 해당 cron 제거 (선택)

---

## ❓ FAQ

### Q1: yaml 파일을 꼭 수정해야 하나요?

**A:** 아니요! Config 파일만 수정해도 됩니다.

yaml은 **자동 실행 시간**만 정의합니다.

- 매달 1일은 이미 설정되어 있음
- 28~30일도 설정되어 있음 (마지막날 하루 전 체크용)
- **대부분의 경우 추가 불필요**

---

### Q2: 매일 다른 시간에 알림을 보내려면?

**A:** Config와 yaml 모두 수정:

Config:

```typescript
{ type: "daily_morning", title: "...", weekday: 1-7, ... }
```

yaml:

```yaml
- cron: "0 0 * * *" # 매일 9시
```

---

### Q3: 한 날짜에 여러 알림을 보내려면?

**A:** Config에 여러 개 추가하되, **조건을 다르게** 설정:

```typescript
{ day: 1, title: "아침 알림", ... },
{ day: 1, title: "저녁 알림", ... },  // ❌ 둘 다 발송되지 않음!
```

**해결:** 시간대를 구분하려면 yaml에서 여러 cron 설정 필요

---

### Q4: 테스트 알림을 보내려면?

**A:** GitHub Actions에서 수동 실행!

- 날짜 체크 없이 즉시 발송
- Config 내용과 무관한 테스트 알림

---

## 🚨 주의사항

### **1. 시간대 (KST vs UTC)**

- GitHub Actions는 UTC 기준
- API는 KST 기준으로 자동 변환
- Cron 설정 시 UTC로 계산 필요

### **2. 동적 날짜 (마지막날)**

- `dayBeforeMonthEnd: true` 사용
- 달마다 날짜가 다름 (28~30일)
- API가 자동으로 정확한 날짜 계산

### **3. Config 타입 안전성**

- TypeScript가 자동으로 타입 체크
- `day`와 `weekday`를 동시에 설정하지 마세요
- 함수 형태의 `body`는 `Date`를 인자로 받아야 함

---

## 📊 실전 예시

### **추가하고 싶은 알림:**

"매달 10일과 20일에 '이번 달 베스트' 알림"

### **Step 1: Config 수정**

```typescript
{
  type: "monthly_10th",
  title: "⭐ 이번 달 베스트!",
  body: "10일 기준 가장 인기있는 행사를 확인하세요!",
  url: "/popular",
  day: 10,
},
{
  type: "monthly_20th",
  title: "⭐ 이번 달 베스트!",
  body: "20일 기준 가장 인기있는 행사를 확인하세요!",
  url: "/popular",
  day: 20,
},
```

### **Step 2: yaml 수정 (선택)**

```yaml
- cron: "0 2 10,20 * *" # 매달 10일, 20일
```

### **완료!**

커밋 & 푸시하면 자동으로 작동합니다.

---

## 📝 체크리스트

새 알림 추가 시:

- [ ] Config 파일에 알림 추가
- [ ] (필요시) yaml에 cron 추가
- [ ] 커밋 & 푸시
- [ ] GitHub Actions에서 수동 실행으로 테스트
- [ ] 실제 알림 수신 확인

---

## 🔗 관련 파일

- `src/config/notification-schedules.ts` - ⭐ **여기만 수정!**
- `.github/workflows/scheduled-notifications.yml` - 스케줄 설정 (선택)
- `src/app/api/notifications/scheduled/route.ts` - API (수정 불필요)

---

**작성일:** 2025-10-12  
**버전:** 2.0 (Config 방식)
