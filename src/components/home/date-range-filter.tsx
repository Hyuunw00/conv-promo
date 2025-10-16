"use client";
import { useState, useEffect } from "react";
import Calendar from "@/components/Calendar";

interface DateRangeFilterProps {
  initialStartDate: string;
  initialEndDate: string;
  onDateRangeChange: (startDate: string, endDate: string) => void;
}

const DATE_RANGE_STORAGE_KEY = "promo-date-range";

export default function DateRangeFilter({
  initialStartDate,
  initialEndDate,
  onDateRangeChange,
}: DateRangeFilterProps) {
  // 로컬 스토리지에서 날짜 범위 가져오기
  const getStoredDateRange = () => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(DATE_RANGE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const storedRange = getStoredDateRange();
  const [startDate, setStartDate] = useState(
    storedRange?.start || initialStartDate
  );
  const [endDate, setEndDate] = useState(storedRange?.end || initialEndDate);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // 초기 로드 시 저장된 날짜 범위 적용
  useEffect(() => {
    if (storedRange) {
      onDateRangeChange(storedRange.start, storedRange.end);
    }
  }, []);

  const handleDateApply = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    onDateRangeChange(newStartDate, newEndDate);

    // 로컬 스토리지에 저장
    try {
      localStorage.setItem(
        DATE_RANGE_STORAGE_KEY,
        JSON.stringify({ start: newStartDate, end: newEndDate })
      );
    } catch (error) {
      console.error("Failed to save date range to localStorage:", error);
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    // YYYY-MM-DD 형식에서 직접 파싱
    const [year, month, day] = dateStr.split("-");
    return `${parseInt(month)}/${parseInt(day)}`;
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-3 py-2">
        <button
          onClick={() => setIsCalendarOpen(true)}
          className="w-full flex items-center justify-between text-xs"
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-gray-700 font-medium">
              {formatDateDisplay(startDate)} ~ {formatDateDisplay(endDate)}
            </span>
          </div>
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      <Calendar
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onApply={handleDateApply}
        initialStartDate={startDate}
        initialEndDate={endDate}
      />
    </div>
  );
}
