export const fmtDate = (d: string | Date) => {
  // Date 객체 생성 대신 문자열 직접 파싱
  const dateStr = typeof d === 'string' ? d : d.toISOString();
  const [year, month, day] = dateStr.split('T')[0].split('-');
  
  // MM/DD 형식으로 반환 (로케일 무관)
  return `${month}/${day}`;
};

/**
 * UTC 시간을 한국 시간(KST)으로 변환
 * @param date Date 객체 (기본값: 현재 시간)
 * @returns 한국 시간대가 적용된 Date 객체
 */
export const toKST = (date: Date = new Date()): Date => {
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const KST_OFFSET = 9; // 한국은 UTC+9
  return new Date(utc + (KST_OFFSET * 60 * 60 * 1000));
};

/**
 * 한국 시간 기준으로 YYYY-MM-DD 형식의 날짜 문자열 반환
 * @param date Date 객체 (기본값: 현재 시간)
 * @returns YYYY-MM-DD 형식의 문자열
 */
export const getKSTDateString = (date: Date = new Date()): string => {
  const kstDate = toKST(date);
  const year = kstDate.getFullYear();
  const month = String(kstDate.getMonth() + 1).padStart(2, '0');
  const day = String(kstDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
