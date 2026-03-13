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

  return (
    <div className="schedule-page">
      {schedules.length === 0 ? (
        <div className="empty-state">
          No assignments to display here.
        </div>
      ) : (
        <>
          <div className="schedule-header-row">
            <div>DATE</div>
            <div>RESEARCH</div>
            <div>PAPER</div>
          </div>

          <div className="schedule-list">
            {schedules.map((schedule: any) => {
              const dateString = formatDateString(schedule.date);
              const researchAssignment = schedule.assignments.find(
                (a: any) => a.role === 'RESEARCH'
              );
              const paperAssignment = schedule.assignments.find(
                (a: any) => a.role === 'PAPER'
              );

              return (
                <section key={schedule.id} className="schedule-row-card">
                  <div className="schedule-cell schedule-date-cell">
                    <div className="mobile-label">Date</div>
                    <div className="date-text">{dateString}</div>
                  </div>

                  <div className="schedule-cell schedule-assignment-cell">
                    <div className="mobile-label">Research</div>
                    <div className="assignment-box">
                      <div>
                        <span className="role-pill research-pill">
                          🔬 Research Presentation
                        </span>
                      </div>
                      <div className="assignee-text">
                        {researchAssignment ? (
                          researchAssignment.member?.name || 'Unknown'
                        ) : (
                          <span className="skipped-badge">Skipped</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="schedule-cell schedule-assignment-cell">
                    <div className="mobile-label">Paper</div>
                    <div className="assignment-box">
                      <div>
                        <span className="role-pill paper-pill">
                          📄 Paper Briefing
                        </span>
                      </div>
                      <div className="assignee-text">
                        {paperAssignment ? (
                          paperAssignment.member?.name || 'Unknown'
                        ) : (
                          <span className="skipped-badge">Skipped</span>
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

      <style jsx>{`
        .schedule-page {
          display: grid;
          gap: 1rem;
        }

        .empty-state {
          border: 1px solid var(--border-color);
          border-radius: 16px;
          background: var(--bg-main);
          padding: 3rem 1.5rem;
          text-align: center;
          color: var(--text-muted);
        }

        .schedule-header-row {
          display: grid;
          grid-template-columns: 220px minmax(0, 1fr) minmax(0, 1fr);
          padding: 0 0.25rem;
          color: var(--text-muted);
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .schedule-header-row > div {
          padding: 0 0.9rem;
        }

        .schedule-list {
          display: grid;
          gap: 0.9rem;
        }

        .schedule-row-card {
          display: grid;
          grid-template-columns: 220px minmax(0, 1fr) minmax(0, 1fr);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          background: var(--bg-main);
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }

        .schedule-cell {
          min-width: 0;
          padding: 1rem 1.1rem;
        }

        .schedule-date-cell {
          display: flex;
          align-items: center;
          background: var(--bg-subtle, #fafafa);
          border-right: 1px solid var(--border-color);
        }

        .schedule-assignment-cell {
          display: flex;
          align-items: center;
        }

        .schedule-assignment-cell:not(:last-child) {
          border-right: 1px solid var(--border-color);
        }

        .date-text {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-main);
          line-height: 1.35;
        }

        .assignment-box {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          justify-content: center;
          width: 100%;
        }

        .role-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 0.3rem 0.65rem;
          border-radius: 999px;
          white-space: nowrap;
        }

        .research-pill {
          background: rgba(37, 99, 235, 0.1);
          color: #2563eb;
        }

        .paper-pill {
          background: rgba(147, 51, 234, 0.1);
          color: #7c3aed;
        }

        .assignee-text {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-main);
          word-break: break-word;
        }

        .skipped-badge {
          display: inline-flex;
          align-items: center;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.28rem 0.6rem;
          border-radius: 999px;
          background: var(--bg-subtle, #f3f4f6);
          color: var(--text-muted);
          border: 1px solid var(--border-color);
        }

        .mobile-label {
          display: none;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.03em;
          text-transform: uppercase;
          margin-bottom: 0.45rem;
        }

        @media (max-width: 900px) {
          .schedule-header-row {
            display: none;
          }

          .schedule-row-card {
            grid-template-columns: 1fr;
          }

          .schedule-date-cell {
            border-right: none;
            border-bottom: 1px solid var(--border-color);
          }

          .schedule-assignment-cell {
            border-right: none !important;
          }

          .schedule-assignment-cell:not(:last-child) {
            border-bottom: 1px solid var(--border-color);
          }

          .mobile-label {
            display: block;
          }

          .schedule-cell {
            padding: 0.95rem 1rem;
          }

          .date-text {
            font-size: 1rem;
          }
        }

        @media (max-width: 640px) {
          .schedule-page {
            gap: 0.85rem;
          }

          .schedule-list {
            gap: 0.75rem;
          }

          .schedule-row-card {
            border-radius: 14px;
          }

          .schedule-cell {
            padding: 0.9rem 0.9rem;
          }

          .role-pill {
            font-size: 0.76rem;
            white-space: normal;
            line-height: 1.3;
          }

          .assignee-text {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </div>
  );
}