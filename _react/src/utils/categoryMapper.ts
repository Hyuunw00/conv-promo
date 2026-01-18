/**
 * 편의점별 다양한 카테고리를 통일된 대분류로 매핑
 */

import { CATEGORY_MAPPING } from "@/constants/category";
import type { UnifiedCategory } from "@/types/category";

/**
 * 원본 카테고리를 통일된 대분류로 변환
 */
export function mapToUnifiedCategory(
  originalCategory: string | null,
): UnifiedCategory | null {
  if (!originalCategory) return null;

  // 직접 매핑 확인
  if (originalCategory in CATEGORY_MAPPING) {
    return CATEGORY_MAPPING[originalCategory];
  }

  // 키워드 기반 매핑 (fallback)
  const lower = originalCategory.toLowerCase();

  if (
    lower.includes("즉석") ||
    lower.includes("간편") ||
    lower.includes("밥") ||
    lower.includes("국") ||
    lower.includes("찌개") ||
    lower.includes("반찬") ||
    lower.includes("면") ||
    lower.includes("식사")
  ) {
    return "식품/간편식";
  }

  if (
    lower.includes("과자") ||
    lower.includes("스낵") ||
    lower.includes("쿠키") ||
    lower.includes("캔디") ||
    lower.includes("초콜릿") ||
    lower.includes("젤리")
  ) {
    return "과자/스낵";
  }

  if (
    lower.includes("음료") ||
    lower.includes("커피") ||
    lower.includes("주스") ||
    lower.includes("탄산") ||
    lower.includes("우유") ||
    lower.includes("생수") ||
    lower.includes("요구르트")
  ) {
    return "음료";
  }

  if (
    lower.includes("생활") ||
    lower.includes("세제") ||
    lower.includes("티슈") ||
    lower.includes("샴푸") ||
    lower.includes("화장품") ||
    lower.includes("위생")
  ) {
    return "생활용품";
  }

  return "기타";
}

/**
 * 통일된 카테고리에서 원본 카테고리 목록으로 역매핑
 */
export function getOriginalCategories(
  unifiedCategory: UnifiedCategory,
): string[] {
  const result: string[] = [];

  for (const [original, unified] of Object.entries(CATEGORY_MAPPING)) {
    if (unified === unifiedCategory) {
      result.push(original);
    }
  }

  return result;
}
