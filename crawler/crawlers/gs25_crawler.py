"""
GS25 크롤러 (Selenium)
- URL: http://gs25.gsretail.com/gscvs/ko/products/event-goods
- 방식: JavaScript 동적 로딩 (AJAX)
- 탭: 1+1, 2+1, 덤증정
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

class GS25Crawler(BaseCrawler):
    """GS25 행사상품 크롤러 (Selenium)"""

    BASE_URL = "http://gs25.gsretail.com/gscvs/ko/products/event-goods"

    def __init__(self):
        super().__init__("GS25")
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
        GS25 행사상품 크롤링 (1+1, 2+1, 덤증정)

        Returns:
            프로모션 데이터 리스트
        """
        try:
            self._setup_driver()
            all_products = []

            # 1+1 상품
            products_1_1 = self._crawl_by_tab(1, '1+1')
            all_products.extend(products_1_1)

            # 2+1 상품
            products_2_1 = self._crawl_by_tab(2, '2+1')
            all_products.extend(products_2_1)

            return all_products

        finally:
            self._close_driver()

    def _crawl_by_tab(self, tab_index: int, tab_name: str) -> List[Dict[str, Any]]:
        """
        탭별 상품 크롤링 (페이지네이션 포함)

        Args:
            tab_index: 탭 인덱스 (1=1+1, 2=2+1, 3=덤증정)
            tab_name: 탭 이름 (로그용)

        Returns:
            상품 리스트
        """
        products = []
        self.logger.info(f"Crawling {tab_name} products...")

        try:
            # 페이지 접속
            self.driver.get(self.BASE_URL)
            time.sleep(2)

            # 탭 클릭 (eventtab 클래스 내부의 a 태그)
            tab_selector = f".eventtab a:nth-child({tab_index})"
            tab_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, tab_selector))
            )
            tab_button.click()
            self.logger.info(f"{tab_name} 탭 클릭 완료")
            time.sleep(2)

            # 상품 리스트 로딩 대기
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, ".prod_list li"))
            )

            # 페이지네이션 처리 (마지막 페이지까지)
            page = 1
            consecutive_no_new = 0  # 연속으로 새 상품이 없는 횟수

            while True:
                self.logger.info(f"{tab_name} - Page {page} 크롤링 중...")

                # 페이지 이동 (2페이지부터)
                if page > 1:
                    try:
                        # 다음 버튼 클릭 (> 버튼으로 페이지 이동)
                        next_button = self.driver.find_element(By.CSS_SELECTOR, '.paging a.next')

                        # 버튼이 비활성화 상태인지 확인
                        if 'disabled' in next_button.get_attribute('class'):
                            self.logger.info(f"{tab_name}: Next button disabled (마지막 페이지)")
                            break

                        next_button.click()
                        time.sleep(2)
                    except Exception as e:
                        self.logger.info(f"{tab_name}: Failed to click next button (마지막 페이지): {e}")
                        break

                # 현재 페이지 상품 수집
                html = self.driver.page_source
                soup = BeautifulSoup(html, 'html.parser')

                # 상품 리스트 파싱
                product_items = soup.select('.prod_list li')

                # 중복 제거 (이미 수집한 상품 제외)
                existing_titles = {p['title'] for p in products}
                new_count = 0

                for item in product_items:
                    try:
                        product = self._parse_product(item, tab_name)
                        if product and product['title'] not in existing_titles:
                            products.append(product)
                            existing_titles.add(product['title'])
                            new_count += 1
                    except Exception as e:
                        self.logger.warning(f"Failed to parse product: {e}")
                        continue

                self.logger.info(f"{tab_name} - Page {page}: Found {new_count} new products (total: {len(products)})")

                # 연속으로 새 상품이 없으면 종료
                if new_count == 0:
                    consecutive_no_new += 1
                    if consecutive_no_new >= 2:  # 2페이지 연속 새 상품 없으면 종료
                        self.logger.info(f"{tab_name}: No new products for 2 consecutive pages, stopping")
                        break
                else:
                    consecutive_no_new = 0

                page += 1

                # 안전장치: 최대 150페이지
                if page > 150:
                    self.logger.warning(f"{tab_name}: Reached max page limit (150)")
                    break

        except Exception as e:
            self.logger.error(f"Failed to crawl {tab_name} tab: {e}")

        return products

    def _parse_product(self, item, tab_name: str) -> Dict[str, Any]:
        """
        개별 상품 파싱

        Args:
            item: BeautifulSoup 상품 엘리먼트
            tab_name: 탭 이름 (1+1, 2+1, 덤증정)

        Returns:
            상품 데이터 딕셔너리
        """
        # 상품명
        name_elem = item.select_one('.tit')
        title = name_elem.text.strip() if name_elem else None

        # title이 없으면 None 반환
        if not title:
            return None

        # 이미지
        img_elem = item.select_one('img')
        image_url = img_elem.get('src') if img_elem else None
        if image_url and image_url.startswith('//'):
            image_url = 'http:' + image_url
        elif image_url and not image_url.startswith('http'):
            image_url = self.BASE_URL.rsplit('/', 3)[0] + image_url

        # 가격
        price_elem = item.select_one('.price .cost')
        price_text = price_elem.text.strip() if price_elem else None
        price = self._parse_price(price_text)

        # deal_type 결정
        deal_type = self._get_deal_type(tab_name)

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
            'category': None,  # GS25는 카테고리 정보 없음
            'start_date': start_date,
            'end_date': last_day,
            'barcode': None,
            'description': None,
        }

    def _get_deal_type(self, tab_name: str) -> str:
        """
        탭 이름으로 deal_type 결정

        Args:
            tab_name: '1+1', '2+1', '덤증정'

        Returns:
            'ONE_PLUS_ONE', 'TWO_PLUS_ONE', 'GIFT' 중 하나
        """
        if '1+1' in tab_name:
            return 'ONE_PLUS_ONE'
        elif '2+1' in tab_name:
            return 'TWO_PLUS_ONE'
        elif '덤증정' in tab_name or '증정' in tab_name:
            return 'GIFT'
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
    crawler = GS25Crawler()
    products = crawler.run()

    print(f"\n=== GS25 크롤링 결과 ===")
    print(f"총 {len(products)}개 상품")

    # 1+1, 2+1, 덤증정 개수 확인
    one_plus_one = [p for p in products if p['deal_type'] == 'ONE_PLUS_ONE']
    two_plus_one = [p for p in products if p['deal_type'] == 'TWO_PLUS_ONE']
    gift = [p for p in products if p['deal_type'] == 'GIFT']

    print(f"1+1: {len(one_plus_one)}개")
    print(f"2+1: {len(two_plus_one)}개")
    print(f"덤증정: {len(gift)}개")

    if products:
        print(f"\n첫 번째 상품 예시:")
        print(products[0])
