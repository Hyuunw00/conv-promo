"use client";

import Header from "@/components/layout/Header";
import PromotionList from "@/components/PromotionList";
import { Promotion } from "@/types/promotion";
import React, { useState } from "react";

interface ClientProps {
  initialData: Promotion[];
  defaultStartDate: string;
  defaultEndDate: string;
}

export default function Client({
  initialData,
  defaultStartDate,
  defaultEndDate,
}: ClientProps) {
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");
  const [selectedDeal, setSelectedDeal] = useState<string>("ALL");

  const [selectedDateRange, setSelectedDateRange] = useState({
    start: defaultStartDate,
    end: defaultEndDate,
  });

  return (
    <>
      <Header
        selectedDeal={selectedDeal}
        selectedBrand={selectedBrand}
        onBrandChange={setSelectedBrand}
        onDealChange={setSelectedDeal}
        onDateRangeChange={(start, end) => setSelectedDateRange({ start, end })}
        initialStartDate={defaultStartDate}
        initialEndDate={defaultEndDate}
      />

      {/* 메인 콘텐츠 */}
      <main className="px-3 pb-16">
        <PromotionList
          initialData={initialData}
          filters={{
            brandName: selectedBrand,
            dealType: selectedDeal,
            startDate: selectedDateRange.start,
            endDate: selectedDateRange.end,
          }}
        />
      </main>
    </>
  );
}
