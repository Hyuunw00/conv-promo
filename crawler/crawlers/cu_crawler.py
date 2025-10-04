"""
CU 크롤러
- URL: https://cu.bgfretail.com/event/plus.do
- API: /event/plusAjax.do
- 방식: AJAX API 직접 호출
- 난이도: 중 (API 엔드포인트 사용 가능)
"""
from typing import List, Dict, Any
from bs4 import BeautifulSoup
from .base_crawler import BaseCrawler
import re
from datetime import datetime
from dateutil.relativedelta import relativedelta

class CUCrawler(BaseCrawler):
    """CU 행사상품 크롤러"""

    BASE_URL = "https://cu.bgfretail.com"
    API_URL = "https://cu.bgfretail.com/event/plusAjax.do"

    def __init__(self):
        super().__init__("CU")

    def _crawl_by_condition(self, search_condition: str, condition_name: str) -> List[Dict[str, Any]]:
        """
        특정 행사 조건으로 크롤링

        Args:
            search_condition: '23' (1+1), '24' (2+1), '' (전체)
            condition_name: 로깅용 이름

        Returns:
            상품 리스트
        """
        products = []
        page_index = 1
        max_pages = 50  # 안전장치

        self.logger.info(f"Crawling {condition_name} products...")

        while page_index <= max_pages:
            try:
                # API 호출
                params = {
                    'pageIndex': page_index,
                    'searchCondition': search_condition,
                    'listType': 0  # 0: 리스트 교체, 1: 리스트 추가
                }

                response = self._request(self.API_URL, method='GET', params=params)

                # HTML 파싱
                soup = BeautifulSoup(response.text, 'html.parser')

                # 상품 목록 추출
                product_items = soup.select('li.prod_list')

                if not product_items:
                    self.logger.info(f"{condition_name}: No more products on page {page_index}")
                    break

                for item in product_items:
                    try:
                        product = self._parse_product(item, search_condition)
                        if product:
                            products.append(product)
                    except Exception as e:
                        self.logger.warning(f"Failed to parse product: {e}")
                        continue

                self.logger.info(f"{condition_name} - Page {page_index}: {len(product_items)} products")
                page_index += 1

            except Exception as e:
                self.logger.error(f"Failed to crawl {condition_name} page {page_index}: {e}")
                break

        return products

    def crawl(self) -> List[Dict[str, Any]]:
        """
        CU 행사상품 크롤링 (1+1, 2+1 모두)

        Returns:
            프로모션 데이터 리스트
        """
        all_products = []

        # 1+1 상품
        products_1_1 = self._crawl_by_condition('23', '1+1')
        all_products.extend(products_1_1)

        # 2+1 상품
        products_2_1 = self._crawl_by_condition('24', '2+1')
        all_products.extend(products_2_1)

        return all_products

    def _parse_product(self, item, search_condition: str) -> Dict[str, Any]:
        """
        개별 상품 파싱

        Args:
            item: BeautifulSoup 상품 엘리먼트
            search_condition: '23' (1+1) or '24' (2+1)

        Returns:
            상품 데이터 딕셔너리
        """
        # 상품명
        name_elem = item.select_one('.name p')
        title = name_elem.text.strip() if name_elem else None

        # 이미지
        img_elem = item.select_one('.prod_img img')
        image_url = img_elem.get('src') if img_elem else None
        if image_url and image_url.startswith('//'):
            image_url = 'https:' + image_url

        # 가격
        price_elem = item.select_one('.price strong')
        price_text = price_elem.text.strip() if price_elem else None
        price = self._parse_price(price_text)

        # 행사 타입 결정
        if search_condition == '23':
            deal_type = 'ONE_PLUS_ONE'
        elif search_condition == '24':
            deal_type = 'TWO_PLUS_ONE'
        else:
            deal_type = 'DISCOUNT'

        # 상품 링크
        link_elem = item.select_one('a')
        source_url = link_elem.get('href') if link_elem else None
        if source_url and not source_url.startswith('http'):
            source_url = self.BASE_URL + source_url

        # 행사 기간 설정 (당월 1일 ~ 말일)
        now = datetime.now()
        start_date = now.replace(day=1).strftime('%Y-%m-%d')
        # 다음 달 1일에서 하루 빼면 이번 달 마지막 날
        last_day = (now.replace(day=1) + relativedelta(months=1) - relativedelta(days=1)).strftime('%Y-%m-%d')

        return {
            'title': title,
            'raw_title': title,
            'deal_type': deal_type,
            'normal_price': price,
            'sale_price': price,
            'image_url': image_url,
            'source_url': source_url,
            'category': None,  # CU에서 카테고리 제공 안 함
            'start_date': start_date,  # 당월 1일
            'end_date': last_day,       # 당월 말일
            'barcode': None,
        }

    def _parse_price(self, price_text: str) -> int:
        """
        가격 텍스트에서 숫자만 추출

        Args:
            price_text: '2,000원' 형태의 텍스트

        Returns:
            정수형 가격
        """
        if not price_text:
            return None
        numbers = re.sub(r'[^\d]', '', price_text)
        return int(numbers) if numbers else None


if __name__ == '__main__':
    # 테스트 실행
    crawler = CUCrawler()
    products = crawler.run()

    print(f"\n=== CU 크롤링 결과 ===")
    print(f"총 {len(products)}개 상품")

    # 1+1, 2+1 개수 확인
    one_plus_one = [p for p in products if p['deal_type'] == 'ONE_PLUS_ONE']
    two_plus_one = [p for p in products if p['deal_type'] == 'TWO_PLUS_ONE']

    print(f"1+1: {len(one_plus_one)}개")
    print(f"2+1: {len(two_plus_one)}개")

    if products:
        print(f"\n첫 번째 상품 예시:")
        print(products[0])
