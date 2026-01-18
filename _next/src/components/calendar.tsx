"use client";

import { useState, useEffect, useRef } from "react";
import { formatDateString } from "@/utils/date";

interface CalendarProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (startDate: string, endDate: string) => void;
  initialStartDate?: string;
  initialEndDate?: string;
}

export default function Calendar({
  isOpen,
  onClose,
  onApply,
  initialStartDate,
}: CalendarProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // 초기 년/월 설정
  const getInitialYearMonth = () => {
    if (initialStartDate) {
      const [year, month] = initialStartDate.split("-").map(Number);
      return { year, month };
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  };

  const { year: initialYear, month: initialMonth } = getInitialYearMonth();
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);

  // 모달 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month);
  };

  const handleYearChange = (direction: "prev" | "next") => {
    setSelectedYear((prev) => (direction === "prev" ? prev - 1 : prev + 1));
  };

  const handleApply = () => {
    // 선택한 월의 첫날과 마지막날 계산
    const startDate = new Date(selectedYear, selectedMonth - 1, 1);
    const endDate = new Date(selectedYear, selectedMonth, 0);

    onApply(formatDateString(startDate), formatDateString(endDate));
    onClose();
  };

  const monthNames = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 z-40 flex items-start justify-center pt-20">
      <div
        ref={modalRef}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-4 animate-slide-down mx-4"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">날짜 선택</h3>
          <button onClick={onClose} className="p-1">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 년도 선택 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => handleYearChange("prev")}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <span className="text-lg font-bold">{selectedYear}년</span>
          <button
            onClick={() => handleYearChange("next")}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* 월 선택 그리드 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {monthNames.map((name, index) => {
            const month = index + 1;
            const isSelected = selectedMonth === month;

            return (
              <button
                key={month}
                onClick={() => handleMonthSelect(month)}
                className={`
                  py-3 px-4 rounded-xl text-sm font-medium transition-colors
                  ${
                    isSelected
                      ? "bg-blue-500 text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                {name}
              </button>
            );
          })}
        </div>

        {/* 선택된 날짜 표시 */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-xs">
          <span className="text-gray-600">선택된 기간: </span>
          <span className="font-medium text-gray-900">
            {selectedYear}년 {selectedMonth}월
          </span>
        </div>

        {/* 적용/취소 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
          >
            취소
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-2.5 text-sm bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium"
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
}
