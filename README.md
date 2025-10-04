# 편의점 프로모션 모아보기

편의점(GS25, CU, 세븐일레븐, 이마트24) 행사 정보를 한 곳에서 확인할 수 있는 웹 애플리케이션입니다.

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth (Google, Kakao OAuth)
- **ORM**: Prisma (설정되어 있으나 현재 미사용)

## 주요 기능

- 편의점 브랜드별 프로모션 조회
- 행사 유형별 필터링 (1+1, 2+1, 할인)
- 프로모션 검색
- 프로모션 저장/북마크
- 소셜 로그인 (Google, Kakao)

## 시작하기

### 필수 요구사항

- Node.js 20 이상
- pnpm

### 설치

```bash
# 의존성 설치
pnpm install

# 환경변수 설정
cp .env.example .env
# .env 파일에 Supabase 설정 추가
```

### 환경변수

`.env` 파일에 다음 환경변수가 필요합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_postgresql_connection_string
```

### 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

### 프로덕션 빌드

```bash
pnpm build
pnpm start
```

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── @modal/            # 병렬 라우트 (모달)
│   ├── login/             # 로그인 페이지
│   ├── saved/             # 저장한 프로모션 페이지
│   └── page.tsx           # 메인 페이지
├── components/            # React 컴포넌트
├── lib/                   # 유틸리티 및 설정
│   ├── supabase/          # Supabase 클라이언트
│   └── auth.ts            # 인증 유틸리티
├── services/              # 비즈니스 로직
│   ├── promotion/         # 프로모션 서비스
│   └── saved/             # 저장 기능 서비스
└── types/                 # TypeScript 타입 정의
```

## 데이터베이스 스키마

### 테이블

- `brand`: 편의점 브랜드 정보
- `promo`: 프로모션 정보
- `saved_promotions`: 사용자가 저장한 프로모션

### 뷰

- `promo_with_brand`: 프로모션과 브랜드 정보를 조인한 뷰

## 스크립트

```bash
# 개발 서버
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 시작
pnpm start

# 린트
pnpm lint

# Prisma 명령어
pnpm prisma generate    # Prisma 클라이언트 생성
pnpm prisma db push     # 스키마 변경사항 푸시
pnpm prisma studio      # Prisma Studio GUI 열기
```

## 라이센스

MIT
