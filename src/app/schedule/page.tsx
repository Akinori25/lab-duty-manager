import prisma from '@/lib/prisma';
import GenerateScheduleButton from '../components/GenerateScheduleButton';
import ScheduleClientPage from './ScheduleClientPage';
import SkipDatesManager from '../components/SkipDatesManager';
import { getSkipDates } from '../actions/skipDates';

export const dynamic = 'force-dynamic';

export default async function SchedulePage() {
  const schedules = await prisma.schedule.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: 'asc' },
    include: {
      assignments: {
        include: { member: true }
      }
    }
  });

  const skipDates = await getSkipDates();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Rotation Schedule</h1>
        <GenerateScheduleButton />
      </div>

      <SkipDatesManager initialSkipDates={skipDates} />

      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1.5rem' }}>Upcoming Duties</h2>

        <ScheduleClientPage schedules={schedules} />
      </div>
    </div>
  );
}
