export const dynamic = 'force-dynamic';
export const revalidate = 0;

import prisma from '@/lib/prisma';
import ScheduleClientPage from './ScheduleClientPage';

export default async function SchedulePage() {
  const schedules = await prisma.schedule.findMany({
    orderBy: { date: 'asc' },
    include: {
      assignments: {
        include: {
          member: true
        }
      }
    }
  });

  const members = await prisma.member.findMany({
    orderBy: { name: 'asc' }
  });

  return <ScheduleClientPage schedules={schedules} members={members} />;
}