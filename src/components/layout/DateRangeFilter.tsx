"use client";
import { useState } from "react";
import Calendar from "@/components/ui/Calendar";

interface DateRangeFilterProps {
  onDateRangeChange: (startDate: string, endDate: string) => void;
}

export default function DateRangeFilter({
  onDateRangeChange,
}: DateRangeFilterProps) {
  const today = new Date();
  const defaultEndDate = new Date(today);
  defaultEndDate.setDate(today.getDate() + 14); // 기본 +14일

  const [startDate, setStartDate] = useState(today.toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(
    defaultEndDate.toISOString().split("T")[0]
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleDateApply = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    onDateRangeChange(newStartDate, newEndDate);
  };

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
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
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
