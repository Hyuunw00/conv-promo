# 편털 - 편의점 프로모션 모아보기

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://conv-promo.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-purple?logo=pwa)](https://web.dev/progressive-web-apps/)

GS25, CU, 세븐일레븐, 이마트24의 1+1, 2+1 행사를 한눈에 확인하세요.

🔗 **라이브 데모**: [https://conv-promo.vercel.app](https://conv-promo.vercel.app)

## ✨ 주요 기능

- 🏪 **4개 편의점 통합** - GS25, CU, 세븐일레븐, 이마트24
- 🔍 **스마트 검색** - 제품명, 브랜드로 빠른 검색 + 자동완성 (네이버 Local Search API)
- 📍 **내 주변 편의점** - 위치 기반 주변 편의점 검색 (네이버 지도 API)
- 🏷️ **다중 필터링** - 브랜드별, 카테고리별, 행사 유형별 (1+1, 2+1, 할인), 날짜 범위
- 💾 **저장 기능** - 관심 프로모션 북마크 (로그인 필요)
- 🔐 **소셜 로그인** - Google, Kakao 간편 로그인
- 📱 **PWA 지원** - 모바일 홈 화면에 설치 가능, 오프라인 지원, 설치 안내 UI
- 🔔 **푸시 알림** - 신규/변경/종료 프로모션 자동 알림
- ♾️ **무한 스크롤** - 부드러운 페이지네이션
- 🤖 **자동 업데이트** - 매주 월요일 새벽 2시(KST) 자동 데이터 갱신 (변경사항만 반영)

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **UI**: React 19, Tailwind CSS 4
- **Icons**: Lucide React
- **PWA**: Serwist 9.2.1 (Service Worker, Offline Support)

### Backend & Database
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma (schema reference)
- **Authentication**: Supabase Auth (Google, Kakao OAuth)
- **API**: Next.js API Routes + Supabase REST API
- **External APIs**: Naver Maps API, Naver Local Search API
- **Push Notifications**: Web Push API + VAPID

### DevOps & Automation
- **Hosting**: Vercel (Auto CI/CD)
- **Crawler**: Python + Selenium (GitHub Actions)
- **Scheduling**: GitHub Actions Cron (Weekly)

## 🚀 시작하기

### 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 환경변수 설정
cp .env.example .env
# .env 파일에 Supabase 설정 추가

# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build
pnpm start
```

### 환경변수

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Naver APIs
NEXT_PUBLIC_NCP_MAPS_CLIENT_ID=your_ncp_maps_client_id
NCP_MAPS_CLIENT_SECRET=your_ncp_maps_client_secret
NAVER_SEARCH_CLIENT_ID=your_naver_search_client_id
NAVER_SEARCH_CLIENT_SECRET=your_naver_search_client_secret

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:your_email@example.com

# Webhook
WEBHOOK_SECRET=your_webhook_secret
BASE_URL=https://your-domain.com
```

## 📁 프로젝트 구조

```
conv-promo/
├── .github/workflows/           # GitHub Actions
│   └── crawler.yml             # 주간 크롤링 자동화
├── crawler/                    # Python 크롤러
│   ├── crawlers/              # 편의점별 크롤러
│   ├── config.py              # 크롤러 설정
│   └── upload_to_db.py        # Supabase 업로드
├── prisma/
│   └── schema.prisma          # DB 스키마 (참고용)
├── public/
│   ├── manifest.json          # PWA 매니페스트
│   ├── icon-192.png           # PWA 아이콘
│   └── sw.js                  # Service Worker (빌드 시 생성)
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── @modal/           # 병렬 라우트 (검색 모달)
│   │   ├── api/              # API Routes
│   │   ├── auth/             # 인증 페이지
│   │   ├── popular/          # 인기 프로모션
│   │   ├── saved/            # 저장된 프로모션
│   │   └── page.tsx          # 홈페이지
│   ├── components/            # React 컴포넌트
│   │   ├── layout/           # 레이아웃 컴포넌트
│   │   ├── InstallBanner.tsx # PWA 설치 안내
│   │   └── ...
│   ├── hooks/                 # Custom Hooks
│   ├── lib/                   # 라이브러리
│   │   └── supabase/         # Supabase 클라이언트
│   ├── services/              # 비즈니스 로직
│   │   ├── promotion/        # 프로모션 서비스
│   │   └── saved/            # 저장 기능 서비스
│   ├── types/                 # TypeScript 타입
│   ├── utils/                 # 유틸리티 함수
│   ├── middleware.ts          # 인증 미들웨어
│   └── sw.ts                  # Service Worker 소스
├── next.config.ts             # Next.js + Serwist 설정
└── package.json
```

## 🤖 자동 크롤링

GitHub Actions를 통해 **매주 월요일 새벽 2시(KST)**에 자동 실행됩니다.

### 특징
- **차분 업데이트**: 변경사항만 감지하여 신규/수정/삭제 처리
- **중복 방지**: `brand_id + title + start_date` 기준으로 고유성 보장
- **자동 알림**: 변경사항 발생 시 구독자에게 푸시 알림 발송
- **수동 실행**: GitHub Actions 탭에서 "Run workflow" 클릭
- **크롤러**: Python + Selenium 기반
- **로그 보관**: 7일간 보관, JSON 백업 30일간 보관

## 📱 PWA 설치

### iOS Safari
공유 버튼 → "홈 화면에 추가"

### Android Chrome
메뉴 → "앱 설치" 또는 "홈 화면에 추가"

## 🚢 배포

### Vercel 배포 (현재 운영 중)

1. GitHub 레포지토리를 Vercel에 연동
2. 환경변수 설정:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Deploy 버튼 클릭
4. 자동 CI/CD 설정 완료 (main 브랜치 push 시 자동 배포)

### 다른 플랫폼
- **Cloudflare Pages**: Edge 환경에서 동작 (Webpack 필수)
- **Netlify**: 기본 설정으로 배포 가능

## 🎯 주요 페이지

- `/` - 홈 (전체 프로모션 리스트)
- `/popular` - 인기 프로모션 (2+1, 1+1 우선)
- `/search` - 검색 (네이버 Local Search API 자동완성)
- `/nearby` - 내 주변 편의점 (네이버 지도 + 위치 기반 검색)
- `/saved` - 저장한 프로모션 (로그인 필요)
- `/mypage` - 마이페이지 (로그인 필요)

## 🔧 개발 정보

### 주요 라이브러리
- `@supabase/ssr` - Supabase SSR 클라이언트
- `@serwist/next` - PWA Service Worker
- `lucide-react` - 아이콘
- `prisma` - ORM (스키마 관리용)

### 빌드 시 주의사항
- PWA는 프로덕션 빌드에서만 활성화됩니다
- Serwist는 Webpack 필수 (Turbopack 미지원)
- Service Worker 파일은 `.gitignore`에 포함

## 📄 라이센스

MIT
