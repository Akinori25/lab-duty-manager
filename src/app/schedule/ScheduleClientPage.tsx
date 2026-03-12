'use client';

import React from 'react';
import { generateSchedules } from '../actions/schedule';
import EmailComposer from '../components/EmailComposer';
import DownloadDutySummaryButton from '../components/DownloadDutySummaryButton';

export default function ScheduleClientPage({
  schedules,
  members
}: {
  schedules: any[];
  members: any[];
}) {
  const handleGenerate = async () => {
    const password = prompt('Admin password');
    if (!password) return;

    try {
      await generateSchedules(password, 8);
    } catch {
      alert('Unauthorized');
    }
  };

  const formatDateString = (date: string | Date) => {
    const d = new Date(date);
    return (
      d.getFullYear() +
      '-' +
      String(d.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(d.getDate()).padStart(2, '0') +
      ' (' +
      d.toLocaleDateString('ja-JP', { weekday: 'short' }) +
      ')'
    );
  };

  const roleLabelStyle = (type: 'paper' | 'research'): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.86rem',
    fontWeight: 600,
    padding: '0.34rem 0.7rem',
    borderRadius: '999px',
    whiteSpace: 'nowrap',
    backgroundColor:
      type === 'paper' ? 'rgba(147, 51, 234, 0.10)' : 'rgba(37, 99, 235, 0.10)',
    color: type === 'paper' ? '#7c3aed' : '#2563eb'
  });

  const skippedStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.82rem',
    fontWeight: 600,
    padding: '0.28rem 0.65rem',
    borderRadius: '999px',
    backgroundColor: 'var(--bg-subtle, #f3f4f6)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-color)'
  };

  const cardStyle: React.CSSProperties = {
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    backgroundColor: 'var(--bg-main)',
    overflow: 'hidden',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
  };

  const assignmentRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    padding: '1rem 1.25rem'
  };

  return (
    <div className="table-container" style={{ display: 'grid', gap: '1rem' }}>
      {schedules.length === 0 ? (
        <div
          style={{
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-main)',
            padding: '3rem 1.5rem',
            textAlign: 'center',
            color: 'var(--text-muted)'
          }}
        >
          No assignments to display here.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {schedules.map((schedule: any) => {
            const dateString = formatDateString(schedule.date);
            const paperAssignment = schedule.assignments.find(
              (a: any) => a.role === 'PAPER'
            );
            const researchAssignment = schedule.assignments.find(
              (a: any) => a.role === 'RESEARCH'
            );

            return (
              <section key={schedule.id} style={cardStyle}>
                <div
                  style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-subtle, #fafafa)'
                  }}
                >
                  <div
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {dateString}
                  </div>
                </div>

                <div style={assignmentRowStyle}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      minWidth: 0
                    }}
                  >
                    <span style={roleLabelStyle('paper')}>📄 Paper Briefing</span>
                  </div>

                  <div
                    style={{
                      textAlign: 'right',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      minWidth: 0
                    }}
                  >
                    {paperAssignment ? (
                      <span
                        style={{
                          wordBreak: 'break-word'
                        }}
                      >
                        {paperAssignment.member?.name || 'Unknown'}
                      </span>
                    ) : (
                      <span style={skippedStyle}>Skipped</span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    borderTop: '1px solid var(--border-color)'
                  }}
                />

                <div style={assignmentRowStyle}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      minWidth: 0
                    }}
                  >
                    <span style={roleLabelStyle('research')}>
                      🔬 Research Presentation
                    </span>
                  </div>

                  <div
                    style={{
                      textAlign: 'right',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      minWidth: 0
                    }}
                  >
                    {researchAssignment ? (
                      <span
                        style={{
                          wordBreak: 'break-word'
                        }}
                      >
                        {researchAssignment.member?.name || 'Unknown'}
                      </span>
                    ) : (
                      <span style={skippedStyle}>Skipped</span>
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}

      <EmailComposer nextSchedule={schedules.length > 0 ? schedules[0] : null} />
      <DownloadDutySummaryButton schedules={schedules} members={members} />
    </div>
  );
}