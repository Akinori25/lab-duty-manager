'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

function getNextThursday(fromDate: Date): Date {
  const d = new Date(Date.UTC(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate()));
  d.setUTCDate(d.getUTCDate() + ((4 + 7 - d.getUTCDay()) % 7 || 7));
  return d;
}

export async function generateSchedules(weeks: number = 8) {
  try {
    let currentDate = new Date();
    
    // Clear any existing schedules that happen in the future from today onwards.
    // We only want to delete schedules that fall on or after the first generated Thursday.
    const firstGenerateDate = getNextThursday(currentDate);

    await prisma.schedule.deleteMany({
      where: { date: { gte: firstGenerateDate } }
    });

    currentDate = firstGenerateDate;

    // Fetch all skip dates in memory beforehand to compare cleanly
    const allSkipDates = await prisma.skipDate.findMany();

    // Maintain in-memory tracking of dates assigned DURING this loop batch.
    const loopAssignedDates = new Map<string, { paper: number, research: number }>();

    for (let i = 0; i < weeks; i++) {
      // Check if schedule already exists
      let schedule = await prisma.schedule.findUnique({
        where: { date: currentDate }
      });

      if (!schedule) {
        schedule = await prisma.schedule.create({
          data: { date: currentDate }
        });
      }

      // If assignments already exist, skip generation for this schedule entirely
      const existingAssignments = await prisma.assignment.count({
        where: { scheduleId: schedule.id }
      });

      if (existingAssignments > 0) continue;

      // 2. Fetch all members and their override dates and explicit absences
      const allMembers = await prisma.member.findMany({
        where: { 
          OR: [
            { isActiveResearch: true },
            { isActivePaper: true }
          ]
        },
        include: {
          absences: true // Fetch all standalone absences for each member
        }
      });

      // Fetch global skip flags for this specific target Date
      const scheduleTimeStr = currentDate.toISOString().split('T')[0];
      const skipRecord = allSkipDates.find(
        (sd: any) => new Date(sd.date).toISOString().split('T')[0] === scheduleTimeStr
      );
      const isResearchSkipped = skipRecord?.isResearchSkipped || false;
      const isPaperSkipped = skipRecord?.isPaperSkipped || false;

      // Filter out members who are explicitly absent on this exact Schedule date
      const availableMembers = allMembers.filter((m: any) => {
        return !m.absences.some((a: any) => new Date(a.date).toISOString().split('T')[0] === scheduleTimeStr);
      });

      // Decorate members with computed stats based strictly on overrideDates + in-memory loop updates
      const membersWithStats = availableMembers.map((member: any) => {
        const overrideP = member.overridePaperDate ? new Date(member.overridePaperDate).getTime() : 0;
        const overrideR = member.overrideResearchDate ? new Date(member.overrideResearchDate).getTime() : 0;
        
        const loopState = loopAssignedDates.get(member.id);
        const effectivePaperDate = loopState?.paper ? Math.max(overrideP, loopState.paper) : overrideP;
        const effectiveResearchDate = loopState?.research ? Math.max(overrideR, loopState.research) : overrideR;

        const scheduleTime = schedule!.date.getTime();
        const msPerDay = 1000 * 60 * 60 * 24;

        const daysSincePaper = effectivePaperDate > 0 ? Math.floor((scheduleTime - effectivePaperDate) / msPerDay) : 10000;
        const daysSinceResearch = effectiveResearchDate > 0 ? Math.floor((scheduleTime - effectiveResearchDate) / msPerDay) : 10000;

        return { ...member, daysSincePaper, daysSinceResearch };
      });

      if (membersWithStats.length < 2) continue; // Not enough members to assign

      // 3. PAPER Assignment
      let selectedPaperId: string | null = null;
      if (!isPaperSkipped) {
        const membersForPaper = membersWithStats.filter((m: any) => m.isActivePaper);
        if (membersForPaper.length > 0) {
          const sortedForPaper = [...membersForPaper].sort((a, b) => {
            if (a.daysSincePaper !== b.daysSincePaper) return b.daysSincePaper - a.daysSincePaper;
            return a.name.localeCompare(b.name); // deterministic tie-breaker
          });
          selectedPaperId = sortedForPaper[0].id;
        }
      }

      // 4. RESEARCH Assignment
      let selectedResearchId: string | null = null;
      if (!isResearchSkipped) {
        const membersForResearch = membersWithStats.filter((m: any) => m.isActiveResearch && m.id !== selectedPaperId);
        if (membersForResearch.length > 0) {
          const sortedForResearch = [...membersForResearch].sort((a, b) => {
            if (a.daysSinceResearch !== b.daysSinceResearch) return b.daysSinceResearch - a.daysSinceResearch;
            return a.name.localeCompare(b.name);
          });
          selectedResearchId = sortedForResearch[0].id;
        }
      }

      // 5. Update in-memory state for NEXT iteration and Create Assignments in DB
      if (selectedPaperId) {
        const currentPaperState = loopAssignedDates.get(selectedPaperId) || { paper: 0, research: 0 };
        loopAssignedDates.set(selectedPaperId, { ...currentPaperState, paper: schedule.date.getTime() });
        await prisma.assignment.create({
          data: { scheduleId: schedule.id, memberId: selectedPaperId, role: 'PAPER' }
        });
      }

      if (selectedResearchId) {
        const currentResearchState = loopAssignedDates.get(selectedResearchId) || { paper: 0, research: 0 };
        loopAssignedDates.set(selectedResearchId, { ...currentResearchState, research: schedule.date.getTime() });
        await prisma.assignment.create({
          data: { scheduleId: schedule.id, memberId: selectedResearchId, role: 'RESEARCH' }
        });
      }

      // Increment date by 1 week for the next iteration
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
