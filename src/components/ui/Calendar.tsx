"use client";

import { useState, useEffect, useRef } from "react";
import { createKSTDate, formatDateString } from "@/utils/date";

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
  initialEndDate,
}: CalendarProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const [tempStartDate, setTempStartDate] = useState<Date | null>(
    initialStartDate ? createKSTDate(initialStartDate) : null
  );
  const [tempEndDate, setTempEndDate] = useState<Date | null>(
    initialEndDate ? createKSTDate(initialEndDate) : null
  );
  const [currentMonth, setCurrentMonth] = useState(createKSTDate());

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

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );

    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      // 첫 선택 또는 리셋
      setTempStartDate(clickedDate);
      setTempEndDate(null);
    } else {
      // 두 번째 선택
      if (clickedDate < tempStartDate) {
        setTempStartDate(clickedDate);
        setTempEndDate(tempStartDate);
      } else {
        setTempEndDate(clickedDate);
      }
    }
  };

  const isDateInRange = (day: number) => {
    if (!tempStartDate || !tempEndDate) return false;
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return date >= tempStartDate && date <= tempEndDate;
  };

  const isDateSelected = (day: number) => {
    if (!tempStartDate && !tempEndDate) return false;
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );

    return (
      (tempStartDate && date.toDateString() === tempStartDate.toDateString()) ||
      (tempEndDate && date.toDateString() === tempEndDate.toDateString())
    );
  };

  const handleApply = () => {
    if (tempStartDate) {
      const start = formatDateString(tempStartDate);
      const end = tempEndDate ? formatDateString(tempEndDate) : start;
      onApply(start, end);
      onClose();
    }
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
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-start justify-center pt-20">
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


        {/* 캘린더 헤더 */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() - 1
                )
              )
            }
            className="p-1.5 hover:bg-gray-100 rounded-lg"
          >
            <svg
              className="w-4 h-4"
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
          <span className="text-sm font-semibold">
            {currentMonth.getFullYear()}년 {monthNames[currentMonth.getMonth()]}
          </span>
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() + 1
                )
              )
            }
            className="p-1.5 hover:bg-gray-100 rounded-lg"
          >
            <svg
              className="w-4 h-4"
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

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-xs text-gray-500 font-medium py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7">
          {/* 빈 칸 채우기 */}
          {Array.from({ length: getFirstDayOfMonth(currentMonth) }).map(
            (_, i) => (
              <div key={`empty-${i}`} className="p-2" />
            )
          )}

          {/* 날짜 */}
          {Array.from({ length: getDaysInMonth(currentMonth) }).map((_, i) => {
            const day = i + 1;
            const isInRange = isDateInRange(day);
            const isSelected = isDateSelected(day);
            const isToday =
              createKSTDate().toDateString() ===
              new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth(),
                day
              ).toDateString();

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`
                  p-2 text-sm rounded-lg transition-colors relative
                  ${isSelected ? "bg-blue-500 text-white font-semibold" : ""}
                  ${isInRange && !isSelected ? "bg-blue-50" : ""}
                  ${!isSelected && !isInRange ? "hover:bg-gray-100" : ""}
                  ${isToday && !isSelected ? "font-bold text-blue-500" : ""}
                `}
              >
                {day}
                {isToday && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* 선택된 날짜 표시 */}
        {tempStartDate && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs">
            <span className="text-gray-600">선택된 날짜: </span>
            <span className="font-medium text-gray-900">
              {tempStartDate.toLocaleDateString("ko-KR")}
              {tempEndDate &&
                tempStartDate.toDateString() !== tempEndDate.toDateString() &&
                ` ~ ${tempEndDate.toLocaleDateString("ko-KR")}`}
            </span>
          </div>
        )}

        {/* 적용/취소 버튼 */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
          >
            취소
          </button>
          <button
            onClick={handleApply}
            disabled={!tempStartDate}
            className="flex-1 py-2.5 text-sm bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
}
