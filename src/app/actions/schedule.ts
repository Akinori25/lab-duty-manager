'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

function getNextThursday(fromDate: Date): Date {
  const d = new Date(fromDate);
  d.setHours(0, 0, 0, 0);

  const diff = (4 - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);

  return d;
}

export async function generateSchedules(password: string, weeks: number = 8) {
  if (password !== process.env.ADMIN_PASSWORD) {
    throw new Error('Unauthorized');
  }

  try {
    let currentDate = new Date();

    const firstGenerateDate = getNextThursday(currentDate);
    const deleteFrom = new Date(firstGenerateDate);
    deleteFrom.setHours(0, 0, 0, 0);

    await prisma.schedule.deleteMany({
      where: { date: { gte: deleteFrom } }
    });

    currentDate = firstGenerateDate;

    const allSkipDates = await prisma.skipDate.findMany();
    const loopAssignedDates = new Map<string, { paper: number; research: number }>();

    for (let i = 0; i < weeks; i++) {
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      let schedule = await prisma.schedule.findFirst({
        where: {
          date: {
            gte: dayStart,
            lte: dayEnd
          }
        }
      });

      if (!schedule) {
        schedule = await prisma.schedule.create({
          data: { date: dayStart }
        });
      }

      const existingAssignments = await prisma.assignment.count({
        where: { scheduleId: schedule.id }
      });

      if (existingAssignments > 0) {
        currentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        continue;
      }

      const allMembers = await prisma.member.findMany({
        where: {
          OR: [{ isActiveResearch: true }, { isActivePaper: true }]
        },
        include: {
          absences: true
        }
      });

      const scheduleDateStr = dayStart.toISOString().split('T')[0];
      const skipRecord = allSkipDates.find(
        (sd: any) => new Date(sd.date).toISOString().split('T')[0] === scheduleDateStr
      );

      const isResearchSkipped = skipRecord?.isResearchSkipped || false;
      const isPaperSkipped = skipRecord?.isPaperSkipped || false;

      const availableMembers = allMembers.filter((m: any) => {
        return !m.absences.some((a: any) => {
          const absenceDate = new Date(a.date);
          absenceDate.setHours(0, 0, 0, 0);
          return absenceDate.getTime() === dayStart.getTime();
        });
      });

      const membersWithStats = availableMembers.map((member: any) => {
        const overrideP = member.overridePaperDate ? new Date(member.overridePaperDate).getTime() : 0;
        const overrideR = member.overrideResearchDate ? new Date(member.overrideResearchDate).getTime() : 0;

        const loopState = loopAssignedDates.get(member.id);
        const effectivePaperDate = loopState?.paper ? Math.max(overrideP, loopState.paper) : overrideP;
        const effectiveResearchDate = loopState?.research ? Math.max(overrideR, loopState.research) : overrideR;

        const scheduleTime = dayStart.getTime();
        const msPerDay = 1000 * 60 * 60 * 24;

        const daysSincePaper =
          effectivePaperDate > 0 ? Math.floor((scheduleTime - effectivePaperDate) / msPerDay) : 10000;
        const daysSinceResearch =
          effectiveResearchDate > 0 ? Math.floor((scheduleTime - effectiveResearchDate) / msPerDay) : 10000;

        return { ...member, daysSincePaper, daysSinceResearch };
      });

      let selectedPaperId: string | null = null;
      if (!isPaperSkipped) {
        const membersForPaper = membersWithStats.filter((m: any) => m.isActivePaper);
        if (membersForPaper.length > 0) {
          const sortedForPaper = [...membersForPaper].sort((a, b) => {
            if (a.daysSincePaper !== b.daysSincePaper) return b.daysSincePaper - a.daysSincePaper;
            return a.name.localeCompare(b.name);
          });
          selectedPaperId = sortedForPaper[0].id;
        }
      }

      let selectedResearchId: string | null = null;
      if (!isResearchSkipped) {
        const membersForResearch = membersWithStats.filter(
          (m: any) => m.isActiveResearch && m.id !== selectedPaperId
        );
        if (membersForResearch.length > 0) {
          const sortedForResearch = [...membersForResearch].sort((a, b) => {
            if (a.daysSinceResearch !== b.daysSinceResearch) return b.daysSinceResearch - a.daysSinceResearch;
            return a.name.localeCompare(b.name);
          });
          selectedResearchId = sortedForResearch[0].id;
        }
      }

      if (selectedPaperId) {
        const currentPaperState = loopAssignedDates.get(selectedPaperId) || { paper: 0, research: 0 };
        loopAssignedDates.set(selectedPaperId, { ...currentPaperState, paper: dayStart.getTime() });

        await prisma.assignment.create({
          data: { scheduleId: schedule.id, memberId: selectedPaperId, role: 'PAPER' }
        });
      }

      if (selectedResearchId) {
        const currentResearchState = loopAssignedDates.get(selectedResearchId) || { paper: 0, research: 0 };
        loopAssignedDates.set(selectedResearchId, { ...currentResearchState, research: dayStart.getTime() });

        await prisma.assignment.create({
          data: { scheduleId: schedule.id, memberId: selectedResearchId, role: 'RESEARCH' }
        });
      }

      currentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    revalidatePath('/');
    revalidatePath('/schedule');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate schedules' };
  }
}