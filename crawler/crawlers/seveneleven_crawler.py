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
        세븐일레븐 행사상품 크롤링 (1+1, 2+1, 할인행사 모두)

        Returns:
            프로모션 데이터 리스트
        """
        all_products = []

        # 1+1 상품 (pTab=1)
        products_1_1 = self._crawl_by_tab('1', '1+1')
        all_products.extend(products_1_1)

        # 2+1 상품 (pTab=2)
        products_2_1 = self._crawl_by_tab('2', '2+1')
        all_products.extend(products_2_1)

        # 할인행사 (pTab=4)
        products_discount = self._crawl_by_tab('4', '할인')
        all_products.extend(products_discount)

        return all_products

    def _crawl_by_tab(self, tab: str, tab_name: str) -> List[Dict[str, Any]]:
        """
        탭별 상품 크롤링

        Args:
            tab: pTab 값 ('1', '2', '4')
            tab_name: 탭 이름 (로그용)

        Returns:
            상품 리스트
        """
        products = []
        page = 1
        page_size = 20
        max_pages = 30

        self.logger.info(f"Crawling {tab_name} products...")

        while page <= max_pages:
            try:
                # AJAX API 호출
                params = {
                    'intPageSize': page_size,
                    'intCurrPage': page,
                    'pTab': tab
                }

                response = self._request(self.API_URL, params=params)
                soup = BeautifulSoup(response.text, 'html.parser')

                # 상품 목록 추출
                product_items = soup.select('li')

                if not product_items:
                    self.logger.info(f"{tab_name}: No more products on page {page}")
                    break

                for item in product_items:
                    try:
                        product = self._parse_product(item)
                        if product:
                            products.append(product)
                    except Exception as e:
                        self.logger.warning(f"Failed to parse product: {e}")
                        continue

                self.logger.info(f"{tab_name} - Page {page}: Found {len(product_items)} products")
                page += 1

            except Exception as e:
                self.logger.error(f"Failed to crawl {tab_name} page {page}: {e}")
                break

        return products

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

        # title이 없으면 None 반환 (필터링)
        if not title:
            return None

        # 이미지
        img_elem = item.select_one('.pic_product img')
        image_url = img_elem.get('src') if img_elem else None
        if image_url and not image_url.startswith('http'):
            image_url = self.BASE_URL + image_url

        # 가격 정보 추출
        # HTML 구조: <span class="product_price"><del>정상가</del><strong>할인가</strong><span>원</span></span>

        # 원본 가격 (del 태그)
        normal_price_elem = item.select_one('del')
        normal_price = self._parse_price(normal_price_elem.text) if normal_price_elem else None

        # 할인 가격 (strong 태그 또는 일반 가격)
        sale_price = None
        price_container = item.select_one('.product_price')

        if price_container:
            strong_elem = price_container.select_one('strong')
            if strong_elem:
                # hide 클래스 제거 후 텍스트 추출
                hide_spans = strong_elem.select('.hide')
                for span in hide_spans:
                    span.decompose()
                sale_price = self._parse_price(strong_elem.get_text(strip=True))

        # strong 태그가 없으면 일반 가격에서 추출
        if not sale_price:
            sale_price_elem = item.select_one('.price span')
            sale_price = self._parse_price(sale_price_elem.text) if sale_price_elem else None

        # 원본 가격이 없으면 (1+1, 2+1의 경우) sale_price를 normal_price로도 설정
        if not normal_price:
            normal_price = sale_price

        # 행사 타입 (태그에서 추출)
        tag_elem = item.select_one('.tag_list_01 li') or item.select_one('.ico_tag')
        tag_text = tag_elem.text.strip() if tag_elem else ''
        deal_type = self._parse_deal_type(tag_text)

        # 상품 ID 추출 (상세 페이지 크롤링용)
        link_elem = item.select_one('a.btn_product_01')
        onclick = link_elem.get('href') if link_elem else None
        product_id = None
        if onclick and 'fncGoView' in onclick:
            # javascript: fncGoView('060847'); 형태에서 ID 추출
            match = re.search(r"fncGoView\('(.+?)'\)", onclick)
            if match:
                product_id = match.group(1)

        # 상세 페이지에서 추가 정보 수집
        description = None
        weight = None
        barcode = None

        if product_id:
            detail_info = self._fetch_product_detail(product_id)
            # 설명과 중량을 합쳐서 description에 저장
            desc_text = detail_info.get('description')
            weight_text = detail_info.get('weight')

            # 중량 정보를 description에 포함
            if weight_text:
                description = f"중량: {weight_text}g"
                if desc_text and desc_text != title:  # 설명이 제목과 다르면 추가
                    description += f" | {desc_text}"
            elif desc_text:
                description = desc_text

            barcode = detail_info.get('barcode')

            # 상세 페이지에서 가격 정보 가져오기 (할인 상품의 경우 정상가가 있음)
            detail_normal_price = detail_info.get('normal_price')
            detail_sale_price = detail_info.get('sale_price')

            # 상세 페이지에 가격 정보가 있으면 우선 사용
            if detail_normal_price:
                normal_price = detail_normal_price
            if detail_sale_price:
                sale_price = detail_sale_price

        # 상품 링크 생성 (POST 방식이지만 URL은 표시용)
        source_url = f"{self.BASE_URL}/product/presentView.asp?pCd={product_id}" if product_id else None

        # 행사 기간 설정 (당월 1일 ~ 말일)
        now = datetime.now()
        start_date = now.replace(day=1).strftime('%Y-%m-%d')
        last_day = (now.replace(day=1) + relativedelta(months=1) - relativedelta(days=1)).strftime('%Y-%m-%d')

        return {
            'title': title,
            'raw_title': title,
            'deal_type': deal_type,
            'normal_price': normal_price,
            'sale_price': sale_price,
            'image_url': image_url,
            'source_url': source_url,
            'category': None,  # 세븐일레븐은 카테고리 정보 없음
            'start_date': start_date,
            'end_date': last_day,
            'barcode': barcode,
            'description': description,  # 중량 + 설명 포함
        }

    def _fetch_product_detail(self, product_id: str) -> Dict[str, Any]:
        """
        상품 상세 페이지에서 추가 정보 수집 (POST 방식)

        Args:
            product_id: 상품 ID

        Returns:
            중량, 바코드, 설명, 정상가, 할인가 등 추가 정보
        """
        try:
            detail_url = f"{self.BASE_URL}/product/presentView.asp"
            # POST 방식으로 요청
            response = self._request(detail_url, method='POST', data={'pCd': product_id})
            soup = BeautifulSoup(response.text, 'html.parser')

            # 상품 설명
            description = None
            desc_elem = soup.select_one('.txt')
            if desc_elem:
                description = desc_elem.text.strip()

            # 중량 정보
            weight = None
            weight_elem = soup.select_one('.productView_content_ul li strong')
            if weight_elem and '중량' in weight_elem.text:
                weight_value = weight_elem.find_next('span')
                if weight_value:
                    weight = weight_value.text.strip()

            # 바코드 (이미지 경로에서 추출)
            barcode = None
            img_elem = soup.select_one('.product_img img')
            if img_elem:
                img_src = img_elem.get('src', '')
                # /upload/product/8801104/212601.1.jpg 형태에서 바코드 추출
                match = re.search(r'/upload/product/(\d+)/', img_src)
                if match:
                    barcode = match.group(1)

            # 가격 정보 (상세 페이지에서 추출)
            # HTML 구조: <span class="product_price"><del>정상가</del><strong>할인가</strong></span>
            normal_price = None
            sale_price = None

            price_container = soup.select_one('.product_price')
            if price_container:
                # 정상가 (del 태그)
                del_elem = price_container.select_one('del')
                if del_elem:
                    normal_price = self._parse_price(del_elem.text)

                # 할인가 (strong 태그)
                strong_elem = price_container.select_one('strong')
                if strong_elem:
                    # hide 클래스 제거
                    for hide in strong_elem.select('.hide'):
                        hide.decompose()
                    sale_price = self._parse_price(strong_elem.get_text(strip=True))

            return {
                'description': description,
                'weight': weight,
                'barcode': barcode,
                'normal_price': normal_price,
                'sale_price': sale_price,
            }

        except Exception as e:
            self.logger.warning(f"Failed to fetch detail for product {product_id}: {e}")
            return {'description': None, 'weight': None, 'barcode': None, 'normal_price': None, 'sale_price': None}

    def _parse_deal_type(self, tag_text: str) -> str:
        """
        태그 텍스트에서 deal_type 추출

        Args:
            tag_text: 태그 텍스트 (예: '1+1', '2+1', '할인')

        Returns:
            'ONE_PLUS_ONE', 'TWO_PLUS_ONE', 'DISCOUNT' 중 하나
        """
        if '1+1' in tag_text or '1＋1' in tag_text:
            return 'ONE_PLUS_ONE'
        elif '2+1' in tag_text or '2＋1' in tag_text:
            return 'TWO_PLUS_ONE'
        elif '할인' in tag_text:
            return 'DISCOUNT'
        else:
            # 태그 없음 또는 기타 - 기본 DISCOUNT
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
