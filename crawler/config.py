"""
크롤러 전역 설정 관리
- 환경변수 로드
- 크롤링 설정값 정의
- Supabase 연결 정보 관리
"""
import os
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# Supabase 설정
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

# 크롤링 설정
CRAWL_DELAY = float(os.getenv("CRAWL_DELAY", "1.0"))
MAX_RETRIES = int(os.getenv("MAX_RETRIES", "3"))
TIMEOUT = int(os.getenv("TIMEOUT", "30"))

# 이미지 설정
DOWNLOAD_IMAGES = os.getenv("DOWNLOAD_IMAGES", "true").lower() == "true"
IMAGE_MAX_WIDTH = int(os.getenv("IMAGE_MAX_WIDTH", "800"))
IMAGE_QUALITY = int(os.getenv("IMAGE_QUALITY", "85"))

# 편의점 브랜드명 매핑 (Supabase brand 테이블의 name과 일치)
BRAND_MAPPING = {
    "GS25": "GS25",
    "CU": "CU",
    "세븐일레븐": "SevenEleven",
    "이마트24": "Emart24"
}

# User-Agent (크롤링 시 봇으로 인식되지 않도록)
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
