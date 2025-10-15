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

    def make_promotion_key(self, promo: Dict[str, Any], brand_id: str = None) -> str:
        """
        프로모션 고유 키 생성 (중복 확인용)

        Args:
            promo: 프로모션 데이터
            brand_id: 브랜드 ID (선택)

        Returns:
            고유 키 (brand_id + title + start_date)
        """
        title = promo.get('title', '')
        start_date = promo.get('start_date', '')

        # 같은 브랜드 내에서 같은 제목의 프로모션은 시작일 기준으로 하나만 존재
        if brand_id:
            return f"{brand_id}_{title}_{start_date}"
        else:
            return f"{title}_{start_date}"

    def get_existing_promotions(self, brand_id: str, start_date: str) -> List[Dict[str, Any]]:
        """
        기존 프로모션 조회

        Args:
            brand_id: 브랜드 UUID
            start_date: 시작일

        Returns:
            기존 프로모션 리스트
        """
        try:
            response = self.client.table('promo').select('*').eq('brand_id', brand_id).eq('start_date', start_date).execute()
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Failed to get existing promotions: {e}")
            return []

    def save_promotions_with_diff(self, brand_name: str, promotions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        변경사항 감지 후 프로모션 저장

        Args:
            brand_name: 브랜드명
            promotions: 크롤링한 프로모션 리스트

        Returns:
            {
                'new': 10,        # 신규 추가
                'updated': 5,     # 업데이트
                'deleted': 3,     # 삭제됨
                'unchanged': 82,  # 변경 없음
                'total': 100      # 총 저장된 개수
            }
        """
        if not promotions:
            logger.warning(f"No promotions to save for {brand_name}")
            return {'new': 0, 'updated': 0, 'deleted': 0, 'unchanged': 0, 'total': 0}

        try:
            # 브랜드 ID 조회
            brand_id = self.get_brand_id(brand_name)
            start_date = promotions[0].get('start_date')

            # 기존 데이터 조회
            existing_promos = self.get_existing_promotions(brand_id, start_date)

            # 고유 키로 매핑
            existing_map = {self.make_promotion_key(p, brand_id): p for p in existing_promos}
            new_map = {self.make_promotion_key(p, brand_id): p for p in promotions}

            # 비교
            existing_keys = set(existing_map.keys())
            new_keys = set(new_map.keys())

            added_keys = new_keys - existing_keys      # 신규
            deleted_keys = existing_keys - new_keys    # 삭제
            common_keys = new_keys & existing_keys     # 공통

            # 통계
            stats = {
                'new': len(added_keys),
                'deleted': len(deleted_keys),
                'updated': 0,
                'unchanged': 0,
                'total': 0
            }

            # 1. 삭제된 프로모션 제거
            if deleted_keys:
                deleted_ids = [existing_map[key]['id'] for key in deleted_keys]
                for promo_id in deleted_ids:
                    self.client.table('promo').delete().eq('id', promo_id).execute()
                logger.info(f"Deleted {len(deleted_ids)} promotions")

            # 2. 신규 프로모션 추가
            new_promos = []
            for key in added_keys:
                promo = new_map[key]
                promo_data = {
                    'brand_id': brand_id,
                    'title': promo.get('title'),
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
                    'description': promo.get('description'),
                }
                new_promos.append(promo_data)

            if new_promos:
                batch_size = 100
                for i in range(0, len(new_promos), batch_size):
                    batch = new_promos[i:i + batch_size]
                    self.client.table('promo').insert(batch).execute()
                logger.info(f"Inserted {len(new_promos)} new promotions")

            # 3. 기존 프로모션 업데이트 확인 (가격/이미지 변경)
            updated_count = 0
            for key in common_keys:
                existing = existing_map[key]
                new = new_map[key]

                # 변경 사항 확인
                changed = False
                update_data = {}

                if existing.get('sale_price') != new.get('sale_price'):
                    update_data['sale_price'] = new.get('sale_price')
                    changed = True

                if existing.get('normal_price') != new.get('normal_price'):
                    update_data['normal_price'] = new.get('normal_price')
                    changed = True

                if existing.get('image_url') != new.get('image_url'):
                    update_data['image_url'] = new.get('image_url')
                    changed = True

                if changed:
                    self.client.table('promo').update(update_data).eq('id', existing['id']).execute()
                    updated_count += 1

            stats['updated'] = updated_count
            stats['unchanged'] = len(common_keys) - updated_count
            stats['total'] = len(new_keys)

            logger.info(f"Save complete - New: {stats['new']}, Updated: {stats['updated']}, Deleted: {stats['deleted']}, Unchanged: {stats['unchanged']}")

            return stats

        except Exception as e:
            logger.error(f"Failed to save promotions with diff for {brand_name}: {e}")
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
