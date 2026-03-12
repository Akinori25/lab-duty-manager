'use client';

import React from 'react';
import { generateSchedules } from '../actions/schedule';
import EmailComposer from '../components/EmailComposer';
import DownloadSchedulePdfButton from '../components/DownloadSchedulePdfButton';

export default function ScheduleClientPage({
  schedules
}: {
  schedules: any[]
}) {

  const handleGenerate = async () => {
    const password = prompt("Admin password");
    if (!password) return;

    try {
      await generateSchedules(password, 8);
    } catch {
      alert("Unauthorized");
    }
  };

  return (
    <div className="table-container">

      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Role</th>
            <th>Assigned To</th>
          </tr>
        </thead>
        <tbody>
          {schedules.length === 0 ? (
            <tr>
              <td colSpan={3} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                No assignments to display here.
              </td>
            </tr>
          ) : (
            schedules.map((schedule: any) => {
              const d = new Date(schedule.date)
              const dateString =
                d.getFullYear() +
                "-" +
                String(d.getMonth() +1).padStart(2,'0') +
                "-" +
                String(d.getDate()).padStart(2,'0') +
                " (" +
                d.toLocaleDateString(undefined,{weekday:'short'}) +
                ")"

              const paperAssignment = schedule.assignments.find((a: any) => a.role === 'PAPER');
              const researchAssignment = schedule.assignments.find((a: any) => a.role === 'RESEARCH');

              return (
                <React.Fragment key={schedule.id}>
                  <tr style={{ borderTop: '1px solid var(--border-color)' }}>
                    <td
                      style={{
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        verticalAlign: 'top',
                        paddingTop: '1rem'
                      }}
                      rowSpan={2}
                    >
                      {dateString}
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      📄 Paper Briefing
                    </td>
                    <td>
                      {paperAssignment ? (
                        <span>{paperAssignment.member?.name || 'Unknown'}</span>
                      ) : (
                        <span className="badge badge-secondary" style={{ backgroundColor: 'var(--bg-main)' }}>
                          Skipped
                        </span>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td style={{ fontWeight: 500 }}>
                      🔬 Research Presentation
                    </td>
                    <td>
                      {researchAssignment ? (
                        <span>{researchAssignment.member?.name || 'Unknown'}</span>
                      ) : (
                        <span className="badge badge-secondary" style={{ backgroundColor: 'var(--bg-main)' }}>
                          Skipped
                        </span>
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
      <EmailComposer nextSchedule={schedules.length > 0 ? schedules[0] : null} />
      <DownloadSchedulePdfButton schedules={schedules} />
    </div>
  );
}