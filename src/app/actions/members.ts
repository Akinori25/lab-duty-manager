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

function toDateOnlyString(date: Date | string | null | undefined) {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

export async function updateMember(
  id: string,
  data: {
    name?: string;
    isActiveResearch?: boolean;
    isActivePaper?: boolean;
    overrideResearchDate?: Date | null;
    overridePaperDate?: Date | null;
    absences?: string[]; // array of YYYY-MM-DD strings
    adminPassword?: string;
  }
) {
  try {
    const existingMember = await prisma.member.findUnique({
      where: { id }
    });

    if (!existingMember) {
      throw new Error('Member not found');
    }

    const isProtectedFieldChanged =
      (data.isActiveResearch !== undefined &&
        data.isActiveResearch !== existingMember.isActiveResearch) ||
      (data.isActivePaper !== undefined &&
        data.isActivePaper !== existingMember.isActivePaper) ||
      (data.overrideResearchDate !== undefined &&
        toDateOnlyString(data.overrideResearchDate) !==
          toDateOnlyString(existingMember.overrideResearchDate)) ||
      (data.overridePaperDate !== undefined &&
        toDateOnlyString(data.overridePaperDate) !==
          toDateOnlyString(existingMember.overridePaperDate));

    if (isProtectedFieldChanged) {
      if (!process.env.ADMIN_PASSWORD) {
        throw new Error('ADMIN_PASSWORD is not configured on the server');
      }

      if (!data.adminPassword || data.adminPassword !== process.env.ADMIN_PASSWORD) {
        throw new Error('Unauthorized: admin password required');
      }
    }

    await prisma.member.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(data.isActiveResearch !== undefined && {
          isActiveResearch: data.isActiveResearch
        }),
        ...(data.isActivePaper !== undefined && {
          isActivePaper: data.isActivePaper
        }),
        ...(data.overrideResearchDate !== undefined && {
          overrideResearchDate: data.overrideResearchDate
        }),
        ...(data.overridePaperDate !== undefined && {
          overridePaperDate: data.overridePaperDate
        }),
        ...(data.absences !== undefined && {
          absences: {
            deleteMany: {},
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
      absences: true
    }
  });

  const today = new Date().getTime();
  const msPerDay = 1000 * 60 * 60 * 24;

  return allMembers.map((member) => {
    const overrideP = member.overridePaperDate
      ? new Date(member.overridePaperDate).getTime()
      : 0;
    const overrideR = member.overrideResearchDate
      ? new Date(member.overrideResearchDate).getTime()
      : 0;

    const daysSincePaper = overrideP > 0 ? Math.floor((today - overrideP) / msPerDay) : 10000;
    const daysSinceResearch =
      overrideR > 0 ? Math.floor((today - overrideR) / msPerDay) : 10000;

    return {
      ...member,
      daysSincePaper,
      daysSinceResearch,
      lastPaperDate: overrideP > 0 ? new Date(overrideP) : null,
      lastResearchDate: overrideR > 0 ? new Date(overrideR) : null
    };
  });
}