"""
Supabase 연동 유틸리티
- DB 연결 및 데이터 저장
- 브랜드 ID 매핑
- 이번 달 데이터 삭제 후 새 데이터 저장
"""
from supabase import create_client, Client
from typing import List, Dict, Any
import config
from utils.logger import setup_logger

logger = setup_logger("supabase_client")

class SupabaseClient:
    """Supabase DB 연동 클래스"""

    def __init__(self):
        """Supabase 클라이언트 초기화"""
        if not config.SUPABASE_URL or not config.SUPABASE_KEY:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")

        self.client: Client = create_client(config.SUPABASE_URL, config.SUPABASE_KEY)
        logger.info("Supabase client initialized")

    def get_brand_id(self, brand_name: str) -> str:
        """
        브랜드명으로 브랜드 ID 조회

        Args:
            brand_name: 브랜드명 (예: "CU", "SevenEleven")

        Returns:
            브랜드 UUID
        """
        try:
            response = self.client.table('brand').select('id').eq('name', brand_name).execute()

            if response.data and len(response.data) > 0:
                brand_id = response.data[0]['id']
                logger.info(f"Brand '{brand_name}' found: {brand_id}")
                return brand_id
            else:
                raise ValueError(f"Brand '{brand_name}' not found in database")
        except Exception as e:
            logger.error(f"Failed to get brand ID for '{brand_name}': {e}")
            raise

    def delete_current_month_promotions(self, brand_id: str, start_date: str):
        """
        이번 달 프로모션 데이터 삭제

        Args:
            brand_id: 브랜드 UUID
            start_date: 시작일 (예: "2025-10-01")
        """
        try:
            response = self.client.table('promo').delete().eq('brand_id', brand_id).eq('start_date', start_date).execute()
            deleted_count = len(response.data) if response.data else 0
            logger.info(f"Deleted {deleted_count} existing promotions for brand {brand_id} starting {start_date}")
        except Exception as e:
            logger.error(f"Failed to delete promotions: {e}")
            raise

    def save_promotions(self, brand_name: str, promotions: List[Dict[str, Any]]) -> int:
        """
        프로모션 데이터 저장

        Args:
            brand_name: 브랜드명 (예: "CU", "SevenEleven")
            promotions: 프로모션 데이터 리스트

        Returns:
            저장된 프로모션 개수
        """
        if not promotions:
            logger.warning(f"No promotions to save for {brand_name}")
            return 0

        try:
            # 브랜드 ID 조회
            brand_id = self.get_brand_id(brand_name)

            # 이번 달 기존 데이터 삭제
            start_date = promotions[0].get('start_date')
            if start_date:
                self.delete_current_month_promotions(brand_id, start_date)

            # 데이터 변환 (brand_id 추가) 및 중복 제거
            data_to_insert = []
            seen_titles = set()  # 중복 확인용

            for promo in promotions:
                title = promo.get('title')

                # 같은 브랜드 내에서 같은 제목의 프로모션 중복 제거
                if title in seen_titles:
                    logger.debug(f"Skipping duplicate title: {title}")
                    continue

                seen_titles.add(title)

                # brand_id 추가 및 필요한 필드만 선택
                promo_data = {
                    'brand_id': brand_id,
                    'title': title,
                    'raw_title': promo.get('raw_title'),
                    'barcode': promo.get('barcode'),
                    'category': promo.get('category'),
                    'deal_type': promo.get('deal_type'),
                    'normal_price': promo.get('normal_price'),
                    'sale_price': promo.get('sale_price'),
                    'start_date': promo.get('start_date'),
                    'end_date': promo.get('end_date'),
                    'image_url': promo.get('image_url'),
                    'source_url': promo.get('source_url'),
                    'description': promo.get('description'),  # 상품 설명 또는 중량 정보
                }
                data_to_insert.append(promo_data)

            # 배치로 삽입 (한 번에 너무 많으면 분할)
            batch_size = 100
            total_inserted = 0

            for i in range(0, len(data_to_insert), batch_size):
                batch = data_to_insert[i:i + batch_size]
                response = self.client.table('promo').insert(batch).execute()
                inserted_count = len(response.data) if response.data else 0
                total_inserted += inserted_count
                logger.info(f"Inserted batch {i//batch_size + 1}: {inserted_count} promotions")

            logger.info(f"Successfully saved {total_inserted} promotions for {brand_name}")
            return total_inserted

        except Exception as e:
            logger.error(f"Failed to save promotions for {brand_name}: {e}")
            raise


if __name__ == '__main__':
    # 테스트
    client = SupabaseClient()

    # 브랜드 ID 조회 테스트
    try:
        cu_id = client.get_brand_id("CU")
        print(f"CU brand ID: {cu_id}")
    except Exception as e:
        print(f"Error: {e}")
