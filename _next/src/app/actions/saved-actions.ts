'use server';

import { SavedPromotionService } from '@/services/saved/saved.service';
import { revalidatePath } from 'next/cache';

export async function removeSavedPromo(userEmail: string, promoId: string) {
  const { data, error } = await SavedPromotionService.removePromotion(userEmail, promoId);
  
  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/saved');
  return { success: data };
}

export async function toggleSavePromo(userEmail: string, promoId: string) {
  const { data, error } = await SavedPromotionService.toggleSave(userEmail, promoId);
  
  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/saved');
  revalidatePath('/');
  return { success: true, saved: data?.saved || false };
}