"""
DB 업로드 스크립트
- 크롤링한 데이터를 Supabase에 저장
- 사용법: python upload_to_db.py [cu|seven|all]
"""
import sys
import json
import os
from datetime import datetime
from crawlers.cu_crawler import CUCrawler
from crawlers.seveneleven_crawler import SevenElevenCrawler
from crawlers.gs25_crawler import GS25Crawler
from crawlers.emart24_crawler import Emart24Crawler
from utils.supabase_client import SupabaseClient
from utils.logger import setup_logger

logger = setup_logger("upload_to_db")

# JSON 저장 디렉토리
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
os.makedirs(DATA_DIR, exist_ok=True)

def upload_cu():
    """CU 데이터 크롤링 및 DB 저장"""
    logger.info("=" * 60)
    logger.info("CU 데이터 업로드 시작")
    logger.info("=" * 60)

    try:
        # JSON 파일 경로
        json_file = os.path.join(DATA_DIR, 'cu_products.json')

        # 1. 크롤링
        logger.info("CU 크롤링 시작...")
        crawler = CUCrawler()
        products = crawler.run()
        logger.info(f"크롤링 완료: {len(products)}개 상품")

        # 2. JSON 파일로 백업 저장
        logger.info(f"JSON 파일로 저장 중: {json_file}")
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
        logger.info(f"✓ JSON 저장 완료")

        # 3. DB 저장
        logger.info("Supabase에 저장 중...")
        client = SupabaseClient()
        count = client.save_promotions("CU", products)

        logger.info("=" * 60)
        logger.info(f"✓ CU 업로드 완료: {count}개 저장됨")
        logger.info("=" * 60)

        return count

    except Exception as e:
        logger.error(f"✗ CU 업로드 실패: {e}")
        raise

def upload_seven():
    """세븐일레븐 데이터 크롤링 및 DB 저장"""
    logger.info("=" * 60)
    logger.info("세븐일레븐 데이터 업로드 시작")
    logger.info("=" * 60)

    try:
        # JSON 파일 경로
        json_file = os.path.join(DATA_DIR, 'seven_products.json')

        # 1. 크롤링
        logger.info("세븐일레븐 크롤링 시작...")
        crawler = SevenElevenCrawler()
        products = crawler.run()
        logger.info(f"크롤링 완료: {len(products)}개 상품")

        # 2. JSON 파일로 백업 저장
        logger.info(f"JSON 파일로 저장 중: {json_file}")
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
        logger.info(f"✓ JSON 저장 완료")

        # 3. DB 저장
        logger.info("Supabase에 저장 중...")
        client = SupabaseClient()
        count = client.save_promotions("SevenEleven", products)

        logger.info("=" * 60)
        logger.info(f"✓ 세븐일레븐 업로드 완료: {count}개 저장됨")
        logger.info("=" * 60)

        return count

    except Exception as e:
        logger.error(f"✗ 세븐일레븐 업로드 실패: {e}")
        raise

def upload_gs25():
    """GS25 데이터 크롤링 및 DB 저장"""
    logger.info("=" * 60)
    logger.info("GS25 데이터 업로드 시작")
    logger.info("=" * 60)

    try:
        # JSON 파일 경로
        json_file = os.path.join(DATA_DIR, 'gs25_products.json')

        # 1. 크롤링
        logger.info("GS25 크롤링 시작...")
        crawler = GS25Crawler()
        products = crawler.run()
        logger.info(f"크롤링 완료: {len(products)}개 상품")

        # 2. JSON 파일로 백업 저장
        logger.info(f"JSON 파일로 저장 중: {json_file}")
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
        logger.info(f"✓ JSON 저장 완료")

        # 3. DB 저장
        logger.info("Supabase에 저장 중...")
        client = SupabaseClient()
        count = client.save_promotions("GS25", products)

        logger.info("=" * 60)
        logger.info(f"✓ GS25 업로드 완료: {count}개 저장됨")
        logger.info("=" * 60)

        return count

    except Exception as e:
        logger.error(f"✗ GS25 업로드 실패: {e}")
        raise

def upload_emart24():
    """이마트24 데이터 크롤링 및 DB 저장"""
    logger.info("=" * 60)
    logger.info("이마트24 데이터 업로드 시작")
    logger.info("=" * 60)

    try:
        # JSON 파일 경로
        json_file = os.path.join(DATA_DIR, 'emart24_products.json')

        # 1. 크롤링
        logger.info("이마트24 크롤링 시작...")
        crawler = Emart24Crawler()
        products = crawler.run()
        logger.info(f"크롤링 완료: {len(products)}개 상품")

        # 2. JSON 파일로 백업 저장
        logger.info(f"JSON 파일로 저장 중: {json_file}")
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
        logger.info(f"✓ JSON 저장 완료")

        # 3. DB 저장
        logger.info("Supabase에 저장 중...")
        client = SupabaseClient()
        count = client.save_promotions("Emart24", products)

        logger.info("=" * 60)
        logger.info(f"✓ 이마트24 업로드 완료: {count}개 저장됨")
        logger.info("=" * 60)

        return count

    except Exception as e:
        logger.error(f"✗ 이마트24 업로드 실패: {e}")
        raise

def upload_all():
    """모든 편의점 데이터 업로드"""
    logger.info("=" * 60)
    logger.info("전체 편의점 데이터 업로드 시작")
    logger.info("=" * 60)

    total_count = 0

    try:
        # CU
        cu_count = upload_cu()
        total_count += cu_count
        print()

        # 세븐일레븐
        seven_count = upload_seven()
        total_count += seven_count
        print()

        # GS25
        gs25_count = upload_gs25()
        total_count += gs25_count
        print()

        # 이마트24
        emart24_count = upload_emart24()
        total_count += emart24_count

        logger.info("=" * 60)
        logger.info(f"✓ 전체 업로드 완료: 총 {total_count}개 저장됨")
        logger.info(f"  - CU: {cu_count}개")
        logger.info(f"  - 세븐일레븐: {seven_count}개")
        logger.info(f"  - GS25: {gs25_count}개")
        logger.info(f"  - 이마트24: {emart24_count}개")
        logger.info("=" * 60)

    except Exception as e:
        logger.error(f"✗ 업로드 중 오류 발생: {e}")
        raise

if __name__ == '__main__':
    if len(sys.argv) > 1:
        target = sys.argv[1].lower()

        if target == 'cu':
            upload_cu()
        elif target == 'seven':
            upload_seven()
        elif target == 'gs25':
            upload_gs25()
        elif target == 'emart24':
            upload_emart24()
        elif target == 'all':
            upload_all()
        else:
            print("Usage: python upload_to_db.py [cu|seven|gs25|emart24|all]")
            sys.exit(1)
    else:
        # 기본: 전체 업로드
        upload_all()
