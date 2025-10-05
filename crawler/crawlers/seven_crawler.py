"""
세븐일레븐 크롤러
- URL: http://www.7-eleven.co.kr/product/presentList.asp
- API: /product/listMoreAjax.asp
- 방식: AJAX API 호출
- 난이도: 중
"""
from typing import List, Dict, Any
from bs4 import BeautifulSoup
from .base_crawler import BaseCrawler
import re
from datetime import datetime
from dateutil.relativedelta import relativedelta

class SevenElevenCrawler(BaseCrawler):
    """세븐일레븐 행사상품 크롤러"""

    BASE_URL = "http://www.7-eleven.co.kr"
    API_URL = "http://www.7-eleven.co.kr/product/listMoreAjax.asp"

    def __init__(self):
        super().__init__("SevenEleven")

    def crawl(self) -> List[Dict[str, Any]]:
        """
        세븐일레븐 행사상품 크롤링

        Returns:
            프로모션 데이터 리스트
        """
        all_products = []
        page = 1
        page_size = 20
        max_pages = 30  # 안전장치 (약 1200개 상품)

        while page <= max_pages:
            self.logger.info(f"Crawling page {page}...")

            try:
                # AJAX API 호출
                params = {
                    'intPageSize': page_size,
                    'intCurrPage': page
                }

                response = self._request(self.API_URL, params=params)
                soup = BeautifulSoup(response.text, 'html.parser')

                # 상품 목록 추출
                product_items = soup.select('li')

                if not product_items:
                    self.logger.info(f"No more products on page {page}")
                    break

                for item in product_items:
                    try:
                        product = self._parse_product(item)
                        if product:
                            all_products.append(product)
                    except Exception as e:
                        self.logger.warning(f"Failed to parse product: {e}")
                        continue

                self.logger.info(f"Page {page}: Found {len(product_items)} products")
                page += 1

            except Exception as e:
                self.logger.error(f"Failed to crawl page {page}: {e}")
                break

        return all_products

    def _parse_product(self, item) -> Dict[str, Any]:
        """
        개별 상품 파싱

        Args:
            item: BeautifulSoup 상품 엘리먼트

        Returns:
            상품 데이터 딕셔너리
        """
        # 상품명
        name_elem = item.select_one('.tit_product')
        if not name_elem:
            name_elem = item.select_one('.name')
        title = name_elem.text.strip() if name_elem else None

        # 이미지
        img_elem = item.select_one('.pic_product img')
        image_url = img_elem.get('src') if img_elem else None
        if image_url and not image_url.startswith('http'):
            image_url = self.BASE_URL + image_url

        # 가격
        price_elem = item.select_one('.price_list span') or item.select_one('.price span')
        price_text = price_elem.text.strip() if price_elem else None
        price = self._parse_price(price_text)

        # 행사 타입 (태그에서 추출)
        tag_elem = item.select_one('.tag_list_01 li') or item.select_one('.ico_tag')
        tag_text = tag_elem.text.strip() if tag_elem else ''
        deal_type = self._parse_deal_type(tag_text)

        # 상품 링크 (상세 페이지)
        link_elem = item.select_one('a.btn_product_01')
        onclick = link_elem.get('href') if link_elem else None
        source_url = None
        if onclick and 'fncGoView' in onclick:
            # javascript: fncGoView('060847'); 형태에서 ID 추출
            product_id = re.search(r"fncGoView\('(.+?)'\)", onclick)
            if product_id:
                source_url = f"{self.BASE_URL}/product/view.asp?pCd={product_id.group(1)}"

        # 행사 기간 설정 (당월 1일 ~ 말일)
        now = datetime.now()
        start_date = now.replace(day=1).strftime('%Y-%m-%d')
        last_day = (now.replace(day=1) + relativedelta(months=1) - relativedelta(days=1)).strftime('%Y-%m-%d')

        return {
            'title': title,
            'raw_title': title,
            'deal_type': deal_type,
            'normal_price': price,
            'sale_price': price,
            'image_url': image_url,
            'source_url': source_url,
            'category': None,
            'start_date': start_date,
            'end_date': last_day,
            'barcode': None,
        }

    def _parse_deal_type(self, tag_text: str) -> str:
        """
        태그 텍스트에서 deal_type 추출

        Args:
            tag_text: 태그 텍스트 (예: '1+1', '2+1')

        Returns:
            'ONE_PLUS_ONE', 'TWO_PLUS_ONE', 'DISCOUNT' 중 하나
        """
        if '1+1' in tag_text or '1＋1' in tag_text:
            return 'ONE_PLUS_ONE'
        elif '2+1' in tag_text or '2＋1' in tag_text:
            return 'TWO_PLUS_ONE'
        else:
            return 'DISCOUNT'

    def _parse_price(self, price_text: str) -> int:
        """
        가격 텍스트에서 숫자만 추출

        Args:
            price_text: '2,000' 형태의 텍스트

        Returns:
            정수형 가격
        """
        if not price_text:
            return None
        numbers = re.sub(r'[^\d]', '', price_text)
        return int(numbers) if numbers else None


if __name__ == '__main__':
    # 테스트 실행
    crawler = SevenElevenCrawler()
    products = crawler.run()

    print(f"\n=== 세븐일레븐 크롤링 결과 ===")
    print(f"총 {len(products)}개 상품")

    # 1+1, 2+1 개수 확인
    one_plus_one = [p for p in products if p['deal_type'] == 'ONE_PLUS_ONE']
    two_plus_one = [p for p in products if p['deal_type'] == 'TWO_PLUS_ONE']

    print(f"1+1: {len(one_plus_one)}개")
    print(f"2+1: {len(two_plus_one)}개")

    if products:
        print(f"\n첫 번째 상품 예시:")
        print(products[0])
