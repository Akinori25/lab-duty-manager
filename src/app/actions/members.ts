'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addMember(name: string) {
  try {
    if (!name.trim()) throw new Error('Name is required');

    await prisma.member.create({
      data: { name: name.trim(), isActiveResearch: true, isActivePaper: true }
    });

    revalidatePath('/members');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateMember(id: string, data: { 
  name?: string; 
  isActiveResearch?: boolean, 
  isActivePaper?: boolean, 
  overrideResearchDate?: Date | null, 
  overridePaperDate?: Date | null,
  absences?: string[] // array of YYYY-MM-DD strings
}) {
  try {
    // Note: since we use SQLite, we can't easily do nested deleteMany/createMany in one clean sweep without transactional risk if not careful, 
    // but Prisma handles nested operations nicely if we specify them.
    await prisma.member.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.isActiveResearch !== undefined && { isActiveResearch: data.isActiveResearch }),
        ...(data.isActivePaper !== undefined && { isActivePaper: data.isActivePaper }),
        ...(data.overrideResearchDate !== undefined && { overrideResearchDate: data.overrideResearchDate }),
        ...(data.overridePaperDate !== undefined && { overridePaperDate: data.overridePaperDate }),
        ...(data.absences !== undefined && {
          absences: {
            deleteMany: {}, // Wipe existing absences
            create: data.absences.map((dateStr) => ({ 
              date: new Date(dateStr) 
            }))
          }
        })
      }
    });

    revalidatePath('/members');
    revalidatePath('/schedule');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getMembersWithStats() {
  const allMembers = await prisma.member.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      absences: true // Include individual absence records to be visible on the frontend
    }
  });

  const today = new Date().getTime();
  const msPerDay = 1000 * 60 * 60 * 24;

  return allMembers.map(member => {
    const overrideP = member.overridePaperDate ? new Date(member.overridePaperDate).getTime() : 0;
    const overrideR = member.overrideResearchDate ? new Date(member.overrideResearchDate).getTime() : 0;

    // If they have never presented, pretend it was 10,000 days ago
    const daysSincePaper = overrideP > 0 ? Math.floor((today - overrideP) / msPerDay) : 10000;
    const daysSinceResearch = overrideR > 0 ? Math.floor((today - overrideR) / msPerDay) : 10000;

    return {
      ...member,
      daysSincePaper,
      daysSinceResearch,
      lastPaperDate: overrideP > 0 ? new Date(overrideP) : null,
      lastResearchDate: overrideR > 0 ? new Date(overrideR) : null
    };
  });
}
