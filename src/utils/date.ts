/**
 * 날짜 문자열을 MM/DD 형식으로 반환
 * @param date 날짜 문자열 또는 Date 객체
 * @returns MM/DD 형식의 문자열
 */
export const fmtDate = (date: string | Date) => {
  const dateStr = typeof date === "string" ? date : date.toISOString();
  const [year, month, day] = dateStr.split("T")[0].split("-");

  return `${month}/${day}`;
};

/**
 * UTC 시간을 한국 시간(KST)으로 변환
 * @param date Date 객체 (기본값: 현재 시간)
 * @returns 한국 시간대가 적용된 Date 객체
 */
export const toKST = (date: Date = new Date()): Date => {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const KST_OFFSET = 9; // 한국은 UTC+9
  return new Date(utc + KST_OFFSET * 60 * 60 * 1000);
};

/**
 * 한국 시간 기준으로 YYYY-MM-DD 형식의 날짜 문자열 반환
 * @param date Date 객체 (기본값: 현재 시간)
 * @returns YYYY-MM-DD 형식의 문자열
 */
export const getKSTDateString = (date: Date = new Date()): string => {
  const kstDate = toKST(date);
  const year = kstDate.getFullYear();
  const month = String(kstDate.getMonth() + 1).padStart(2, "0");
  const day = String(kstDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * 로컬 Date 객체를 YYYY-MM-DD 형식의 문자열로 변환
 * (이미 로컬 시간인 Date 객체용)
 * @param date Date 객체
 * @returns YYYY-MM-DD 형식의 문자열
 */
export const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * 날짜 문자열이나 Date 객체를 KST Date 객체로 생성
 * Calendar 같은 Date 객체가 필요한 컴포넌트용
 * @param dateInput YYYY-MM-DD 문자열 또는 Date 객체
 * @returns KST가 적용된 Date 객체
 */
export const createKSTDate = (dateInput?: string | Date): Date => {
  if (!dateInput) {
    return toKST(new Date());
  }

  if (typeof dateInput === "string") {
    // YYYY-MM-DD 형식을 로컬 시간으로 파싱
    const [year, month, day] = dateInput.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  return toKST(dateInput);
};
