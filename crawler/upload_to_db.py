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

        # 3. DB 저장 (변경사항 감지)
        logger.info("Supabase에 저장 중...")
        client = SupabaseClient()
        stats = client.save_promotions_with_diff("CU", products)

        logger.info("=" * 60)
        logger.info(f"✓ CU 업로드 완료")
        logger.info(f"  신규: {stats['new']}개, 업데이트: {stats['updated']}개, 삭제: {stats['deleted']}개")
        logger.info("=" * 60)

        # GitHub Actions 파싱용 JSON 출력
        result_json = json.dumps({'CU': stats})
        print(f"CRAWLER_RESULTS={result_json}")
        logger.info(f"CRAWLER_RESULTS={result_json}")

        return stats

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

        # 3. DB 저장 (변경사항 감지)
        logger.info("Supabase에 저장 중...")
        client = SupabaseClient()
        stats = client.save_promotions_with_diff("SevenEleven", products)

        logger.info("=" * 60)
        logger.info(f"✓ 세븐일레븐 업로드 완료")
        logger.info(f"  신규: {stats['new']}개, 업데이트: {stats['updated']}개, 삭제: {stats['deleted']}개")
        logger.info("=" * 60)

        # GitHub Actions 파싱용 JSON 출력
        result_json = json.dumps({'SevenEleven': stats})
        print(f"CRAWLER_RESULTS={result_json}")
        logger.info(f"CRAWLER_RESULTS={result_json}")

        return stats

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

        # 3. DB 저장 (변경사항 감지)
        logger.info("Supabase에 저장 중...")
        client = SupabaseClient()
        stats = client.save_promotions_with_diff("GS25", products)

        logger.info("=" * 60)
        logger.info(f"✓ GS25 업로드 완료")
        logger.info(f"  신규: {stats['new']}개, 업데이트: {stats['updated']}개, 삭제: {stats['deleted']}개")
        logger.info("=" * 60)

        # GitHub Actions 파싱용 JSON 출력
        result_json = json.dumps({'GS25': stats})
        print(f"CRAWLER_RESULTS={result_json}")
        logger.info(f"CRAWLER_RESULTS={result_json}")

        return stats

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

        # 3. DB 저장 (변경사항 감지)
        logger.info("Supabase에 저장 중...")
        client = SupabaseClient()
        stats = client.save_promotions_with_diff("Emart24", products)

        logger.info("=" * 60)
        logger.info(f"✓ 이마트24 업로드 완료")
        logger.info(f"  신규: {stats['new']}개, 업데이트: {stats['updated']}개, 삭제: {stats['deleted']}개")
        logger.info("=" * 60)

        # GitHub Actions 파싱용 JSON 출력
        result_json = json.dumps({'Emart24': stats})
        print(f"CRAWLER_RESULTS={result_json}")
        logger.info(f"CRAWLER_RESULTS={result_json}")

        return stats

    except Exception as e:
        logger.error(f"✗ 이마트24 업로드 실패: {e}")
        raise

def upload_all():
    """모든 편의점 데이터 업로드"""
    logger.info("=" * 60)
    logger.info("전체 편의점 데이터 업로드 시작")
    logger.info("=" * 60)

    total_stats = {'new': 0, 'updated': 0, 'deleted': 0, 'unchanged': 0}
    results = {}

    try:
        # CU
        cu_stats = upload_cu()
        results['CU'] = cu_stats
        for key in total_stats:
            total_stats[key] += cu_stats.get(key, 0)
        print()

        # 세븐일레븐
        seven_stats = upload_seven()
        results['SevenEleven'] = seven_stats
        for key in total_stats:
            total_stats[key] += seven_stats.get(key, 0)
        print()

        # GS25
        gs25_stats = upload_gs25()
        results['GS25'] = gs25_stats
        for key in total_stats:
            total_stats[key] += gs25_stats.get(key, 0)
        print()

        # 이마트24
        emart24_stats = upload_emart24()
        results['Emart24'] = emart24_stats
        for key in total_stats:
            total_stats[key] += emart24_stats.get(key, 0)

        logger.info("=" * 60)
        logger.info(f"✓ 전체 업로드 완료")
        logger.info(f"  총 신규: {total_stats['new']}개")
        logger.info(f"  총 업데이트: {total_stats['updated']}개")
        logger.info(f"  총 삭제: {total_stats['deleted']}개")
        logger.info(f"  총 변경없음: {total_stats['unchanged']}개")
        logger.info("=" * 60)

        # JSON 형식으로도 출력 (GitHub Actions에서 파싱용)
        result_json = json.dumps(results)
        print(f"CRAWLER_RESULTS={result_json}")
        logger.info(f"CRAWLER_RESULTS={result_json}")

        return results

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
