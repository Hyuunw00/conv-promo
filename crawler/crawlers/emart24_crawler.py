"""
이마트24 크롤러 (Selenium)
- URL: https://www.emart24.co.kr/goods/event
- 방식: JavaScript 동적 로딩
- 탭: 1+1, 2+1 (골라담기 제외)
- 카테고리: 간편식사, 과자, 음료, 생활용품
- 난이도: 높음 (Selenium 필요)
"""
from typing import List, Dict, Any
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from bs4 import BeautifulSoup
import time
from datetime import datetime
from dateutil.relativedelta import relativedelta
from .base_crawler import BaseCrawler
import re

class Emart24Crawler(BaseCrawler):
    """이마트24 행사상품 크롤러 (Selenium)"""

    BASE_URL = "https://www.emart24.co.kr/goods/event"

    # 카테고리 매핑 (base_category_seq 파라미터 값)
    CATEGORIES = {
        '간편식사': '1',
        '과자': '2',
        '생활용품': '3',
        '음료': '5',
    }

    # 혜택 타입 매핑 (category_seq 파라미터 값)
    BENEFIT_TYPES = {
        '1+1': '1',
        '2+1': '2',
    }

    def __init__(self):
        super().__init__("Emart24")
        self.driver = None

    def _setup_driver(self):
        """Selenium WebDriver 설정"""
        chrome_options = Options()
        chrome_options.add_argument('--headless')  # 백그라운드 실행
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')

        self.driver = webdriver.Chrome(options=chrome_options)
        self.driver.implicitly_wait(10)
        self.logger.info("Selenium WebDriver 초기화 완료")

    def _close_driver(self):
        """WebDriver 종료"""
        if self.driver:
            self.driver.quit()
            self.logger.info("Selenium WebDriver 종료")

    def crawl(self) -> List[Dict[str, Any]]:
        """
        이마트24 행사상품 크롤링 (1+1, 2+1 x 카테고리별)

        Returns:
            프로모션 데이터 리스트
        """
        try:
            self._setup_driver()
            all_products = []

            # 1+1, 2+1 각각에 대해 크롤링
            for benefit_name, benefit_code in self.BENEFIT_TYPES.items():
                self.logger.info(f"=== {benefit_name} 크롤링 시작 ===")
                products = self._crawl_by_benefit(benefit_code, benefit_name)
                all_products.extend(products)

            return all_products

        finally:
            self._close_driver()

    def _crawl_by_benefit(self, benefit_code: str, benefit_name: str) -> List[Dict[str, Any]]:
        """
        혜택 타입별 크롤링 (카테고리별)

        Args:
            benefit_code: '1' (1+1) 또는 '2' (2+1)
            benefit_name: '1+1' 또는 '2+1'

        Returns:
            상품 리스트
        """
        products = []

        # 각 카테고리별로 크롤링
        for category_name, category_code in self.CATEGORIES.items():
            self.logger.info(f"{benefit_name} - {category_name} 크롤링 시작...")

            category_products = []

            # URL: category_seq=혜택타입, base_category_seq=카테고리
            url = f"{self.BASE_URL}?search=&category_seq={benefit_code}&base_category_seq={category_code}&align="

            try:
                self.driver.get(url)
                self.logger.info(f"{benefit_name} - {category_name} 페이지 접속")
                time.sleep(3)

                # 상품 리스트 로딩 대기
                WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, ".itemWrap"))
                )

                # 페이지네이션 처리 (마지막 페이지까지)
                page = 1
                consecutive_no_new = 0

                while True:
                    self.logger.info(f"{benefit_name} - {category_name} - Page {page} 크롤링 중...")

                    # 페이지 이동 (2페이지부터)
                    if page > 1:
                        try:
                            # 페이지 번호 클릭 (.pIndex span)
                            page_buttons = self.driver.find_elements(By.CSS_SELECTOR, f'.pIndex span')
                            clicked = False
                            for btn in page_buttons:
                                if btn.text.strip() == str(page):
                                    btn.click()
                                    time.sleep(2)
                                    clicked = True
                                    break

                            if not clicked:
                                self.logger.info(f"{benefit_name} - {category_name}: Page {page} 버튼을 찾을 수 없음 (마지막 페이지)")
                                break
                        except Exception as e:
                            self.logger.warning(f"{benefit_name} - {category_name}: Failed to click page {page}: {e}")
                            break

                    # 현재 페이지 상품 수집
                    html = self.driver.page_source
                    soup = BeautifulSoup(html, 'html.parser')

                    # 상품 리스트 파싱
                    product_items = soup.select('.itemWrap')

                    # 중복 제거 (이미 수집한 상품 제외)
                    existing_titles = {p['title'] for p in category_products}
                    new_count = 0

                    for item in product_items:
                        try:
                            product = self._parse_product(item, benefit_name, category_name)
                            if product and product['title'] not in existing_titles:
                                category_products.append(product)
                                existing_titles.add(product['title'])
                                new_count += 1
                        except Exception as e:
                            self.logger.warning(f"Failed to parse product: {e}")
                            continue

                    self.logger.info(f"{benefit_name} - {category_name} - Page {page}: {new_count}개 새 상품 (총: {len(category_products)}개)")

                    # 연속으로 새 상품이 없으면 종료
                    if new_count == 0:
                        consecutive_no_new += 1
                        if consecutive_no_new >= 2:
                            self.logger.info(f"{benefit_name} - {category_name}: No new products for 2 consecutive pages, stopping")
                            break
                    else:
                        consecutive_no_new = 0

                    page += 1

                    # 안전장치: 최대 100페이지
                    if page > 100:
                        self.logger.warning(f"{benefit_name} - {category_name}: Reached max page limit (100)")
                        break

                products.extend(category_products)

            except Exception as e:
                self.logger.error(f"Failed to crawl {benefit_name} - {category_name}: {e}")

        return products

    def _parse_product(self, item, benefit_name: str, category_name: str) -> Dict[str, Any]:
        """
        개별 상품 파싱

        Args:
            item: BeautifulSoup 상품 엘리먼트
            benefit_name: '1+1' 또는 '2+1'
            category_name: 카테고리명 (간편식사, 과자, 생활용품, 음료)

        Returns:
            상품 데이터 딕셔너리
        """
        # 상품명 (.itemtitle p a)
        name_elem = item.select_one('.itemtitle p a') or item.select_one('.itemtitle')
        title = name_elem.text.strip() if name_elem else None

        # title이 없으면 None 반환
        if not title:
            return None

        # 이미지 (.itemSpImg img)
        img_elem = item.select_one('.itemSpImg img')
        image_url = img_elem.get('src') if img_elem else None
        if image_url and image_url.startswith('//'):
            image_url = 'https:' + image_url
        elif image_url and image_url.startswith('/'):
            image_url = 'https://www.emart24.co.kr' + image_url

        # 가격 (.price)
        price_elem = item.select_one('.price')
        price_text = price_elem.text.strip() if price_elem else None
        price = self._parse_price(price_text)

        # deal_type 결정
        deal_type = self._get_deal_type(benefit_name)

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
            'source_url': self.BASE_URL,
            'category': category_name,  # URL 파라미터로 결정된 카테고리
            'start_date': start_date,
            'end_date': last_day,
            'barcode': None,
            'description': None,
        }

    def _get_deal_type(self, benefit_name: str) -> str:
        """
        혜택 타입으로 deal_type 결정

        Args:
            benefit_name: '1+1' 또는 '2+1'

        Returns:
            'ONE_PLUS_ONE' 또는 'TWO_PLUS_ONE'
        """
        if '1+1' in benefit_name:
            return 'ONE_PLUS_ONE'
        elif '2+1' in benefit_name:
            return 'TWO_PLUS_ONE'
        else:
            return 'DISCOUNT'

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
    crawler = Emart24Crawler()
    products = crawler.run()

    print(f"\n=== 이마트24 크롤링 결과 ===")
    print(f"총 {len(products)}개 상품")

    # 1+1, 2+1 개수 확인
    one_plus_one = [p for p in products if p['deal_type'] == 'ONE_PLUS_ONE']
    two_plus_one = [p for p in products if p['deal_type'] == 'TWO_PLUS_ONE']

    print(f"1+1: {len(one_plus_one)}개")
    print(f"2+1: {len(two_plus_one)}개")

    # 카테고리별 개수
    categories = {}
    for p in products:
        cat = p.get('category') or '미분류'
        categories[cat] = categories.get(cat, 0) + 1

    print(f"\n카테고리별 개수:")
    for cat, count in categories.items():
        print(f"  {cat}: {count}개")

    if products:
        print(f"\n첫 번째 상품 예시:")
        print(products[0])
