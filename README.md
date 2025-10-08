# 편털 - 편의점 프로모션 모아보기

GS25, CU, 세븐일레븐, 이마트24의 1+1, 2+1 행사를 한눈에 확인하세요.

## ✨ 주요 기능

- 🏪 **4개 편의점 통합** - GS25, CU, 세븐일레븐, 이마트24
- 🔍 **스마트 검색** - 제품명, 브랜드로 빠른 검색
- 🏷️ **필터링** - 브랜드별, 행사 유형별 (1+1, 2+1, 할인)
- 💾 **저장 기능** - 관심 프로모션 북마크
- 🔐 **소셜 로그인** - Google, Kakao 간편 로그인
- 📱 **PWA 지원** - 모바일 홈 화면에 설치 가능, 오프라인 지원
- 🤖 **자동 업데이트** - 매주 월요일 새벽 자동 데이터 갱신

## 🛠 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS 4
- **PWA**: Serwist (Service Worker)
- **Backend**: Supabase (PostgreSQL, Auth)
- **Automation**: GitHub Actions (주간 크롤링)

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
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📁 프로젝트 구조

```
conv-promo/
├── .github/workflows/     # GitHub Actions (자동 크롤링)
├── crawler/              # Python 크롤러
├── public/              # PWA 아이콘, manifest
├── src/
│   ├── app/            # Next.js App Router
│   ├── components/     # React 컴포넌트
│   ├── services/       # 비즈니스 로직
│   └── sw.ts           # Service Worker
└── next.config.ts      # Serwist PWA 설정
```

## 🤖 자동 크롤링

GitHub Actions를 통해 **매주 월요일 새벽 2시(KST)**에 자동 실행됩니다.

- **수동 실행**: GitHub Actions 탭에서 "Run workflow" 클릭
- **크롤러**: Python + Selenium 기반
- **로그 보관**: 7일간 보관

## 📱 PWA 설치

### iOS Safari
공유 버튼 → "홈 화면에 추가"

### Android Chrome
메뉴 → "앱 설치" 또는 "홈 화면에 추가"

## 🔑 OAuth 설정

배포 시 각 OAuth 제공자에 Redirect URI 등록이 필요합니다.

### Google OAuth
[Google Cloud Console](https://console.cloud.google.com/)에서 설정
- Redirect URI: `https://yourdomain.com/auth/callback`

### Kakao OAuth
[Kakao Developers](https://developers.kakao.com/)에서 설정
- Redirect URI: `https://yourdomain.com/auth/callback`

## 🚢 배포

### 권장 플랫폼
- Vercel (권장)
- Netlify
- Cloudflare Pages

환경변수를 배포 플랫폼에서 설정해야 합니다.

## 📄 라이센스

MIT
