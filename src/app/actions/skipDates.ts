'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function startOfLocalDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfLocalDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function getSkipDates() {
  return await prisma.skipDate.findMany({
    orderBy: { date: 'asc' }
  });
}

export async function addSkipDate(
  dateStr: string,
  isResearchSkipped: boolean,
  isPaperSkipped: boolean
) {
  try {
    const localDate = parseLocalDate(dateStr);
    const dayStart = startOfLocalDay(localDate);
    const dayEnd = endOfLocalDay(localDate);

    const existing = await prisma.skipDate.findFirst({
      where: {
        date: {
          gte: dayStart,
          lte: dayEnd
        }
      }
    });

    if (existing) {
      await prisma.skipDate.update({
        where: { id: existing.id },
        data: { isResearchSkipped, isPaperSkipped }
      });
    } else {
      await prisma.skipDate.create({
        data: {
          date: dayStart,
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