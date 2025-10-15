/**
 * 가격 포맷팅 유틸리티
 */

export function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR');
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
