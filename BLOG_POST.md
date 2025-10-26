# 편의점 행사 비교 PWA '편털' 만들기 - 완전 자동화부터 PWA 설치 전략까지

<img src="https://conv-promo.vercel.app/icon-512.png" width="200px"/>

---

## 🎯 왜 만들었나?

### "편의점 앱 4개를 깔았습니다..."

편의점 1+1 행사를 확인하려면:

1. **GS25 앱** 열기 → 행사 탭 → 1+1 필터
2. **CU 앱** 열기 → 행사 탭 → 1+1 필터
3. **세븐일레븐 앱** 열기 → ...
4. **이마트24 앱** 열기 → ...

**4개 앱을 일일이 확인하는 게 너무 귀찮았습니다.**

게다가 어제 본 행사를 오늘 다시 찾으려면? 또 4개 앱을 순회... 😵

### "그냥 한 곳에서 보면 안 될까?"

이런 불편함에서 시작한 프로젝트가 **편털(편의점 털기)**입니다.

**✅ 4개 편의점 행사를 한 화면에서 비교**
**✅ 원하는 상품 검색하면 어느 편의점이 제일 싼지 한눈에**
**✅ 새 행사 시작하면 자동으로 알림**

**🔗 지금 바로 사용해보세요: [https://conv-promo.vercel.app](https://conv-promo.vercel.app)**

---

## ✨ 뭘 만들었나?

### 🏠 1) 홈 - 모든 행사를 한눈에

<img src="[스크린샷: 홈 화면 - 필터 + 프로모션 리스트]" width="700px"/>

- **4개 편의점 통합**: GS25, CU, 세븐일레븐, 이마트24의 모든 행사
- **다양한 필터**: 브랜드, 카테고리(식품/과자/음료/생활용품), 행사 유형(1+1/2+1)
- **날짜 범위**: 이번 달 행사만 보거나, 기간 직접 선택
- **무한 스크롤**: 부드럽게 계속 로딩
- **저장순/최신순 정렬**: 인기 행사부터 또는 최신 행사부터

> 💡 **실사용 시나리오**
> "CU에서 음료 1+1 행사 뭐 있지?"
> → 브랜드: CU, 카테고리: 음료, 행사: 1+1 필터 적용 → 바로 확인!

---

### 🔍 2) 검색 - 원하는 상품 빠르게 찾기

<img src="[스크린샷: 검색 화면 - 자동완성]" width="700px"/>

- **실시간 자동완성**: "신라면" 입력하면 관련 상품 즉시 제안 (Naver Local Search API)
- **편의점별 비교**: 같은 상품이 어느 편의점에서 행사 중인지 비교
- **가격 비교 기능**: 동일 상품의 편의점별 가격 비교

> 💡 **실사용 시나리오**
> "신라면 1+1 어디서 해?"
> → 검색창에 "신라면" 입력 → GS25, CU 모두 표시 → 원하는 곳 선택!

---

### 📍 3) 내 주변 - 가까운 편의점 찾기

<img src="[스크린샷: 내 주변 지도 화면]" width="700px"/>

- **지도에서 한눈에**: 현재 위치 기준 주변 편의점 표시
- **반경 필터**: 500m / 1km / 2km 선택 가능
- **브랜드 필터**: "GS25만 보고 싶어" → 브랜드 필터 적용
- **네이버 지도 연동**: 길찾기 버튼 클릭 → 네이버 지도 앱으로 바로 이동

> 💡 **실사용 시나리오**
> "지금 있는 곳 근처 CU 어디 있지?"
> → 내 주변 탭 → 브랜드: CU 필터 → 지도에서 확인 → 길찾기!

---

### 💾 4) 저장 - 관심 행사 북마크 + 절약 금액 계산

<img src="[스크린샷: 저장 페이지]" width="700px"/>

- **하트 버튼으로 저장**: 마음에 드는 행사를 저장해두고 나중에 확인
- **절약 금액 계산**: 저장한 상품들의 할인가로 총 얼마를 절약할 수 있는지 자동 계산
- **필터 지원**: 저장한 행사도 브랜드별, 카테고리별 필터 가능
- **일괄 삭제**: 편집 모드로 여러 개 선택 → 삭제
- **로그인 필요**: Google, Kakao 간편 로그인 지원

> 💡 **실사용 시나리오**
> "이번 달 장보면 얼마나 절약할 수 있지?"
> → 저장 탭 → 관심 상품 확인 → 총 절약 금액 한눈에 체크!

---

### 🔔 5) 푸시 알림 - 새 행사 자동 알림

<img src="[스크린샷: 푸시 알림]" width="400px"/>

- **매주 자동 업데이트**: 월요일 새벽 2시마다 새 행사 자동 수집
- **푸시 알림**: 새로운 행사가 추가되거나 삭제되면 자동으로 알림 발송
- **PWA 설치 필요**: 홈 화면에 추가하면 알림 받을 수 있음

> 💡 **실사용 시나리오**
> 사용자는 아무것도 안 해도 됨!
> → 매주 월요일 자동으로 데이터 업데이트 → 새 행사 있으면 알림 받음

---

## 🎨 사용자 경험 (UX)

### 📱 PWA로 앱처럼 사용하기

<img src="[스크린샷: PWA 설치 배너 + 설치 후 화면]" width="700px"/>

**편털을 홈 화면에 추가하면?**

- ✅ **앱처럼 전체 화면**: 브라우저 주소창 없이 깔끔하게
- ✅ **오프라인 지원**: 인터넷 없어도 저장한 행사 확인 가능
- ✅ **빠른 실행**: 홈 화면 아이콘 터치 → 바로 실행
- ✅ **스플래시 스크린**: 앱 로딩 시 브랜드 이미지 표시
- ✅ **푸시 알림**: 새 행사 알림 자동 수신

**설치 방법**

- **Android**: 3초 후 하단 배너 "설치하기" 버튼
- **iOS**: 공유 버튼 → "홈 화면에 추가" (자세한 가이드 모달 제공)

---

### 🔄 매주 자동 업데이트 - 사용자는 아무것도 안 해도 됩니다!

```
월요일 새벽 2시
  ↓
GitHub Actions 자동 실행
  ↓
4개 편의점 사이트 크롤링
  ↓
변경사항 감지 (신규/수정/삭제)
  ↓
DB 자동 업데이트
  ↓
푸시 알림 발송 (구독자에게)
```

**사용자는 그냥 앱만 열면 항상 최신 행사를 볼 수 있습니다!**

---

## 💻 어떻게 만들었나? (기술 구현)

### 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL, Auth)
- **PWA**: Serwist 9.2.1 (Service Worker, Offline Support)
- **Automation**: Python Selenium + GitHub Actions
- **External APIs**: Naver Maps API, Naver Local Search API

---

### 1. 완전 자동화 데이터 파이프라인 (GitHub Actions + Python Selenium)

#### 문제 상황

4개 편의점 사이트를 매주 수동으로 크롤링하는 것은 불가능합니다. 데이터가 매주 바뀌고, 신규/수정/삭제를 일일이 확인할 수 없었습니다.

#### 해결 방법

**GitHub Actions Cron**으로 매주 월요일 새벽 2시(KST)에 자동으로 크롤링을 실행하도록 설계했습니다.

```yaml
# .github/workflows/crawler.yml
name: Weekly Crawler

on:
  schedule:
    - cron: "0 17 * * 0" # 일요일 17시 UTC = 월요일 02시 KST
  workflow_dispatch: # 수동 실행 가능

jobs:
  crawl:
    runs-on: ubuntu-latest
    timeout-minutes: 180

    steps:
      - name: Run CU crawler
        continue-on-error: true # 한 크롤러 실패해도 다른 크롤러 계속 실행
        run: |
          cd crawler
          python upload_to_db.py cu
```

**핵심은 변경사항 감지 알고리즘**입니다. 단순히 데이터를 덮어쓰지 않고, `brand_id + title + start_date`를 고유키로 사용해 신규/수정/삭제를 자동으로 분류합니다.

```python
# crawler/utils/supabase_client.py
def save_promotions_with_diff(self, brand_name: str, products: list):
    """변경사항 감지하여 신규/수정/삭제 처리"""

    # 1. 기존 데이터 조회
    existing = self.supabase.table('promo').select('*').eq('brand_id', brand_id).execute()
    existing_map = {f"{p['title']}_{p['start_date']}": p for p in existing.data}

    # 2. 신규 데이터와 비교
    new_map = {f"{p['title']}_{p['start_date']}": p for p in products}

    # 3. 신규/수정/삭제 분류
    new_keys = set(new_map.keys()) - set(existing_map.keys())
    deleted_keys = set(existing_map.keys()) - set(new_map.keys())

    # 4. DB 업데이트 + Webhook 호출 (푸시 알림 발송)
    if new_keys or deleted_keys:
        self.trigger_webhook(brand_name, {
            'new': len(new_keys),
            'deleted': len(deleted_keys)
        })
```

#### 결과

- ✅ 수동 운영 **완전 제로**
- ✅ 크롤링 로그 7일 보관, JSON 백업 30일 보관
- ✅ 변경사항 발생 시 **구독자에게 자동 푸시 알림**

---

### 2. PWA 설치율 극대화 전략

#### 문제 상황

단순히 PWA를 지원하는 것만으로는 사용자가 설치하지 않습니다. 재방문율을 높이려면 **적극적인 설치 유도**가 필요했습니다.

#### 해결 방법

**1) 3초 지연 설치 배너**
페이지 로드 즉시 배너를 띄우면 사용자가 부담을 느낍니다. 3초 후 자연스럽게 배너를 표시합니다.

```tsx
// src/components/notifications/AppInstallBanner.tsx
useEffect(() => {
  const handler = (e: Event) => {
    e.preventDefault();
    setDeferredPrompt(e);

    // 3초 후 배너 표시
    setTimeout(() => setShowBanner(true), 3000);
  };

  window.addEventListener("beforeinstallprompt", handler);
}, []);
```

**2) iOS 수동 설치 가이드**
iOS Safari는 자동 설치 프롬프트를 지원하지 않습니다. 대신 단계별 설치 방법을 모달로 안내합니다.

**3) 설치 후 자동 알림 권한 요청**
PWA 설치를 감지하면 2초 후 푸시 알림 권한을 자동으로 요청합니다.

```tsx
// src/components/notifications/NotificationPromptAuto.tsx
useEffect(() => {
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

  if (isStandalone && Notification.permission === "default") {
    setTimeout(() => setShowPrompt(true), 2000);
  }
}, []);
```

#### 결과

- ✅ 단순 PWA 지원 → **사용자 행동 유도 설계**로 전환
- ✅ 네이티브 앱 수준의 UX 제공

---

### 3. Server/Client 하이브리드 렌더링 (Next.js 15 App Router)

#### 문제 상황

SEO를 위해서는 SSR이 필요하지만, 무한 스크롤이나 필터링 같은 인터랙션은 클라이언트에서 처리해야 합니다.

#### 해결 방법

**1) Server Component 기반 초기 로딩**

```tsx
// src/app/page.tsx (Server Component)
export default async function HomePage({ searchParams }) {
  const supabase = await createServerClient();

  // 서버에서 초기 데이터 fetch
  const { data: initialData } = await supabase
    .from("promo_with_brand")
    .select("*")
    .order("saved_count", { ascending: false })
    .limit(20);

  return <Client initialData={initialData} />;
}
```

**2) 통합 Hook으로 복잡도 감소**
무한 스크롤, 저장 기능, 필터 리페치를 하나의 `usePromotions` 훅으로 통합했습니다.

```tsx
// src/hooks/use-promotions.ts
export function usePromotions({ initialData, fetchData }) {
  const [promos, setPromos] = useState(initialData);
  const [page, setPage] = useState(1);

  // 무한 스크롤 + 저장 기능 + 필터 리페치 통합
  return { promos, hasMore, fetchMore, resetData, handleSaveToggle };
}
```

**3) React Compiler v1.0 자동 메모이제이션**
수동으로 `useMemo`, `useCallback`을 추가하지 않아도 자동 최적화됩니다.

---

## 🔧 기술적 챌린지와 해결

### 1. iOS Safe Area 대응

**문제**: iPhone의 노치 영역 때문에 헤더가 상태바 아래에 떠 있는 것처럼 보임

**해결**: CSS `env(safe-area-inset-top)` 변수로 Safe Area 패딩 적용

```css
/* src/styles/global.css */
.pt-safe {
  padding-top: env(safe-area-inset-top);
}
```

---

### 2. 필터 즉시 반영 문제

**문제**: FilterBottomSheet에서 필터 적용해도 기존 데이터가 그대로 남음

**해결**: useEffect로 필터 변경 감지 → 즉시 데이터 리페치

```tsx
// src/components/promo-list.tsx
useEffect(() => {
  const refetchData = async () => {
    const result = await fetchPromotions({ ...filters });
    if (!result.error) resetData(result.data);
  };
  refetchData();
}, [filters.brandName, filters.category, filters.dealType]);
```

---

### 3. 크롤러 안정성 확보

**문제**: 하나의 크롤러 실패 시 전체 중단

**해결**: 각 크롤러 독립 실행 + `continue-on-error: true`

```yaml
- name: Run CU crawler
  continue-on-error: true
  timeout-minutes: 30
```

---

## ⚠️ 한계점 및 개선 예정

### 현재 한계점

**1. 재고 정보 미제공**

- 편의점 각 매장의 재고는 각 편의점 공식 앱에서만 확인 가능
- 크롤링으로는 온라인 행사 정보만 수집 가능
- 실제 매장 방문 시 품절일 수 있음

**2. 행사 기간 정보 제약**

- 대부분의 편의점 행사는 상품별 세부 기간이 공개되지 않음
- 월별 행사 데이터로 제공되어, 정확한 시작/종료일 표시 어려움
- 일부 행사는 조기 종료될 수 있음

**3. 제한적인 행사 유형**

- 현재 1+1, 2+1 행사만 지원
- 할인, 증정, 덤, 기획전 등 기타 프로모션은 미지원
- 복합 행사 (예: 1+1 + 추가 증정)는 표시되지 않음

### 개선 예정

- [ ] **다양한 행사 유형 추가**: 할인, 증정, 덤, 기획전 등 1+1/2+1 외 프로모션 지원
- [ ] **알림 유형 다양화**: 현재 신규/삭제 2가지만 지원 → 저장한 행사 종료 임박, 관심 카테고리 신규 행사 등 다양한 알림 추가
- [ ] **사용자 재고 제보 기능**: 커뮤니티 기반으로 품절 정보 공유
- [ ] **상세 행사 기간 정보**: 크롤링 알고리즘 개선으로 더 정확한 기간 제공

---

## 📊 성과 및 회고

### 개발 규모

- **기간**: 2025.09 ~ 진행 중 (약 2개월)
- **Commits**: 113개
- **TypeScript 파일**: 91개
- **주요 페이지**: 홈, 검색, 내 주변, 저장, FAQ, 인기 행사, 가격 비교

### 배운 점

1. **DevOps 자동화 사고의 내재화**

   - 반복 작업을 발견하면 즉시 자동화 파이프라인으로 전환

2. **1인 풀사이클 개발 책임감**

   - 기획, FE, BE, 크롤러, 인프라, 장애 대응까지 전 과정 오너십

3. **최신 기술 스택 실전 적용**
   - Next.js 15, React 19, React Compiler v1.0
   - Server/Client 하이브리드 렌더링

### 향후 계획

- [ ] 알림 커스터마이징 (관심 브랜드/카테고리만 알림)
- [ ] 가격 추이 그래프
- [ ] 사용자 리뷰 기능

---

## 🎯 사용해보세요!

**편털**은 편의점 행사를 놓치고 싶지 않은 모든 분들을 위한 서비스입니다.

### 🔗 Links

- **라이브 데모**: [https://conv-promo.vercel.app](https://conv-promo.vercel.app)
- **GitHub**: [Repository](https://github.com/yourusername/conv-promo)

**💬 피드백 환영**
궁금한 점이나 개선 아이디어가 있다면 댓글이나 GitHub Issue로 남겨주세요!
이 프로젝트가 도움이 되셨다면 ⭐️ Star를 눌러주시면 감사하겠습니다 😊

---

**Tech Stack**
`Next.js 15` `React 19` `TypeScript` `Supabase` `PWA(Serwist)` `Python Selenium` `GitHub Actions` `Naver Maps API` `Tailwind CSS 4` `React Compiler`
