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

  const rolePillStyle = (type: 'research' | 'paper'): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.8rem',
    fontWeight: 700,
    padding: '0.3rem 0.65rem',
    borderRadius: '999px',
    whiteSpace: 'nowrap',
    backgroundColor:
      type === 'research'
        ? 'rgba(37, 99, 235, 0.10)'
        : 'rgba(147, 51, 234, 0.10)',
    color: type === 'research' ? '#2563eb' : '#7c3aed'
  });

  const skippedStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.8rem',
    fontWeight: 600,
    padding: '0.28rem 0.6rem',
    borderRadius: '999px',
    backgroundColor: 'var(--bg-subtle, #f3f4f6)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-color)'
  };

  const cardRowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '220px minmax(0, 1fr) minmax(0, 1fr)',
    alignItems: 'stretch',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    backgroundColor: 'var(--bg-main)',
    overflow: 'hidden',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
  };

  const cellStyle: React.CSSProperties = {
    padding: '1rem 1.1rem',
    minWidth: 0
  };

  const assignmentBoxStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.55rem',
    height: '100%',
    justifyContent: 'center'
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
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '220px minmax(0, 1fr) minmax(0, 1fr)',
              gap: 0,
              padding: '0 0.25rem',
              color: 'var(--text-muted)',
              fontSize: '0.82rem',
              fontWeight: 700,
              letterSpacing: '0.02em'
            }}
          >
            <div style={{ padding: '0 0.9rem' }}>DATE</div>
            <div style={{ padding: '0 0.9rem' }}>RESEARCH</div>
            <div style={{ padding: '0 0.9rem' }}>PAPER</div>
          </div>

          <div style={{ display: 'grid', gap: '0.9rem' }}>
            {schedules.map((schedule: any) => {
              const dateString = formatDateString(schedule.date);
              const researchAssignment = schedule.assignments.find(
                (a: any) => a.role === 'RESEARCH'
              );
              const paperAssignment = schedule.assignments.find(
                (a: any) => a.role === 'PAPER'
              );

              return (
                <section key={schedule.id} style={cardRowStyle}>
                  <div
                    style={{
                      ...cellStyle,
                      backgroundColor: 'var(--bg-subtle, #fafafa)',
                      borderRight: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: 'var(--text-main)',
                          lineHeight: 1.35
                        }}
                      >
                        {dateString}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      ...cellStyle,
                      borderRight: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={assignmentBoxStyle}>
                      <div>
                        <span style={rolePillStyle('research')}>
                          🔬 Research Presentation
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '1rem',
                          fontWeight: 600,
                          color: 'var(--text-main)',
                          wordBreak: 'break-word'
                        }}
                      >
                        {researchAssignment ? (
                          researchAssignment.member?.name || 'Unknown'
                        ) : (
                          <span style={skippedStyle}>Skipped</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={cellStyle}>
                    <div style={assignmentBoxStyle}>
                      <div>
                        <span style={rolePillStyle('paper')}>
                          📄 Paper Briefing
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '1rem',
                          fontWeight: 600,
                          color: 'var(--text-main)',
                          wordBreak: 'break-word'
                        }}
                      >
                        {paperAssignment ? (
                          paperAssignment.member?.name || 'Unknown'
                        ) : (
                          <span style={skippedStyle}>Skipped</span>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </>
      )}

      <EmailComposer nextSchedule={schedules.length > 0 ? schedules[0] : null} />
      <DownloadDutySummaryButton schedules={schedules} members={members} />
    </div>
  );
}