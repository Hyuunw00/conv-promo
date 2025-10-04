"""
기본 크롤러 클래스
- 모든 편의점 크롤러가 상속받는 베이스 클래스
- 공통 기능: HTTP 요청, 에러 처리, 재시도 로직 등
"""
import time
import requests
from abc import ABC, abstractmethod
from typing import List, Dict, Any
from utils.logger import setup_logger
import config

class BaseCrawler(ABC):
    """모든 편의점 크롤러의 기본 클래스"""

    def __init__(self, brand_name: str):
        """
        Args:
            brand_name: 브랜드명 (예: "Emart24")
        """
        self.brand_name = brand_name
        self.logger = setup_logger(f"{brand_name.lower()}_crawler")
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': config.USER_AGENT
        })

    def _request(self, url: str, method: str = 'GET', **kwargs) -> requests.Response:
        """
        HTTP 요청 with 재시도 로직

        Args:
            url: 요청 URL
            method: HTTP 메서드 (GET, POST 등)
            **kwargs: requests 라이브러리에 전달할 추가 파라미터

        Returns:
            Response 객체
        """
        for attempt in range(config.MAX_RETRIES):
            try:
                self.logger.debug(f"Request {method} {url} (attempt {attempt + 1})")

                if method == 'GET':
                    response = self.session.get(url, timeout=config.TIMEOUT, **kwargs)
                elif method == 'POST':
                    response = self.session.post(url, timeout=config.TIMEOUT, **kwargs)
                else:
                    raise ValueError(f"Unsupported method: {method}")

                response.raise_for_status()
                time.sleep(config.CRAWL_DELAY)  # 서버 부하 방지
                return response

            except requests.RequestException as e:
                self.logger.warning(f"Request failed (attempt {attempt + 1}/{config.MAX_RETRIES}): {e}")
                if attempt == config.MAX_RETRIES - 1:
                    raise
                time.sleep(2 ** attempt)  # 지수 백오프

    @abstractmethod
    def crawl(self) -> List[Dict[str, Any]]:
        """
        크롤링 실행 (각 편의점별로 구현 필요)

        Returns:
            프로모션 데이터 리스트
            예: [
                {
                    'title': '코카콜라',
                    'deal_type': 'ONE_PLUS_ONE',
                    'normal_price': 2000,
                    'sale_price': 2000,
                    'start_date': '2025-01-01',
                    'end_date': '2025-01-31',
                    'image_url': 'https://...',
                    'category': '음료',
                    ...
                }
            ]
        """
        pass

    def run(self) -> List[Dict[str, Any]]:
        """
        크롤링 실행 및 로깅

        Returns:
            크롤링한 프로모션 데이터
        """
        self.logger.info(f"Starting {self.brand_name} crawler...")
        try:
            data = self.crawl()
            self.logger.info(f"Successfully crawled {len(data)} items from {self.brand_name}")
            return data
        except Exception as e:
            self.logger.error(f"Failed to crawl {self.brand_name}: {e}", exc_info=True)
            return []
