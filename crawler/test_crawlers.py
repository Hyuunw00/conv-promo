"""
크롤러 테스트 스크립트
- 각 편의점 크롤러를 실행해서 실제 데이터 확인
- DB 스키마와 비교하기 위한 샘플 데이터 출력
"""
import json
from crawlers.cu_crawler import CUCrawler

def test_cu():
    """CU 크롤러 테스트"""
    print("="*60)
    print("CU 크롤러 테스트 시작")
    print("="*60)

    crawler = CUCrawler()
    products = crawler.run()

    print(f"\n총 {len(products)}개 상품 수집")

    if products:
        # 첫 5개 상품 출력
        print("\n=== 샘플 데이터 (처음 5개) ===")
        for i, product in enumerate(products[:5], 1):
            print(f"\n[{i}] {product['title']}")
            print(f"  - 행사: {product['deal_type']}")
            print(f"  - 가격: {product['normal_price']}원")
            print(f"  - 이미지: {product['image_url'][:60]}..." if product['image_url'] else "  - 이미지: None")
            print(f"  - URL: {product['source_url'][:60]}..." if product['source_url'] else "  - URL: None")

        # JSON 파일로 저장 (전체 데이터)
        with open('cu_sample_data.json', 'w', encoding='utf-8') as f:
            json.dump(products[:20], f, ensure_ascii=False, indent=2)
        print(f"\n상위 20개 데이터가 'cu_sample_data.json'에 저장되었습니다.")

        # 데이터 필드 분석
        print("\n=== 데이터 필드 분석 ===")
        sample = products[0]
        print("수집된 필드:")
        for key, value in sample.items():
            value_type = type(value).__name__
            has_data = "✓" if value is not None else "✗"
            print(f"  {has_data} {key:15} ({value_type})")

    return products

if __name__ == '__main__':
    # CU 테스트
    cu_products = test_cu()

    print("\n" + "="*60)
    print("테스트 완료!")
    print("="*60)
