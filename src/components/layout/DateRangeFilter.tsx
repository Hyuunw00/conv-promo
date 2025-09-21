"use client";
import { useState } from "react";
import Calendar from "@/components/ui/Calendar";

interface DateRangeFilterProps {
  initialStartDate: string;
  initialEndDate: string;
  onDateRangeChange: (startDate: string, endDate: string) => void;
}

export default function DateRangeFilter({
  initialStartDate,
  initialEndDate,
  onDateRangeChange,
}: DateRangeFilterProps) {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleDateApply = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    onDateRangeChange(newStartDate, newEndDate);
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
