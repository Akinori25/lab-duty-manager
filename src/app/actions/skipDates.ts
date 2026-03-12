'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getSkipDates() {
  return await prisma.skipDate.findMany({
    orderBy: { date: 'asc' }
  });
}

export async function addSkipDate(dateStr: string, isResearchSkipped: boolean, isPaperSkipped: boolean) {
  try {
    const existing = await prisma.skipDate.findFirst({
      where: { date: new Date(dateStr) }
    });

    if (existing) {
      await prisma.skipDate.update({
        where: { id: existing.id },
        data: { isResearchSkipped, isPaperSkipped }
      });
    } else {
      await prisma.skipDate.create({
        data: { 
          date: new Date(dateStr), 
          isResearchSkipped, 
          isPaperSkipped 
        }
      });
    }

    revalidatePath('/schedule');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function removeSkipDate(id: string) {
  try {
    await prisma.skipDate.delete({ where: { id } });
    revalidatePath('/schedule');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
