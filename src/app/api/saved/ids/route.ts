import { NextResponse } from "next/server";
import { SavedPromotionService } from "@/services/saved/saved.service";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ data: [] });
    }

    const { data, error } = await SavedPromotionService.fetchSavedPromoIds(
      user.email
    );

    if (error) {
      console.error("Error fetching saved promo ids:", error);
      return NextResponse.json({ data: [] });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ data: [] });
  }
}
