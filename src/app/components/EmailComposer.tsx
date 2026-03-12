'use client';

import { useState } from 'react';

const ROOM_OPTIONS = [
  'Conference Room No.7 (on the 6th floor)',
  'Conference Room No.10 (on the 8th floor)',
  'Conference Room No.11 (on the 8th floor)',
  "Professor's room",
  'Others'
] as const;

function getOrdinal(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;

  if (mod10 === 1 && mod100 !== 11) return `${n}st`;
  if (mod10 === 2 && mod100 !== 12) return `${n}nd`;
  if (mod10 === 3 && mod100 !== 13) return `${n}rd`;
  return `${n}th`;
}

function formatConferenceDate(date: Date) {
  const months = [
    'Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.',
    'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'
  ];

  return `${months[date.getMonth()]} ${getOrdinal(date.getDate())}`;
}

export default function EmailComposer({
  nextSchedule
}: {
  nextSchedule: any | null
}) {
  const [room, setRoom] = useState<string>(ROOM_OPTIONS[0]);
  const [otherRoom, setOtherRoom] = useState('');
  const [time, setTime] = useState('4:00 pm');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!nextSchedule) return;

    const date = new Date(nextSchedule.date);
    const formattedDate = formatConferenceDate(date);

    const paperAssignment = nextSchedule.assignments?.find(
      (a: any) => a.role === 'PAPER'
    );
    const researchAssignment = nextSchedule.assignments?.find(
      (a: any) => a.role === 'RESEARCH'
    );

    const paperName = paperAssignment?.member?.name ?? 'TBD';
    const researchName = researchAssignment?.member?.name ?? 'TBD';

    const selectedRoom =
      room === 'Others' ? (otherRoom.trim() || 'TBD') : room;

    const emailText = `Dear everyone,

The next Thursday afternoon conference (${formattedDate}) will be held in ${selectedRoom} at ${time}.
 
Research presentation: ${researchName}
Paper briefing: ${paperName}

Best regards,
Akinori Kinoshita`;

    try {
      await navigator.clipboard.writeText(emailText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert('Failed to copy email text.');
    }
  };

  return (
    <div
      style={{
        marginTop: '2rem',
        padding: '1.25rem',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        backgroundColor: 'var(--bg-card)'
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Email Composer</h2>

      {!nextSchedule ? (
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          No upcoming schedule found.
        </p>
      ) : (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <label
              htmlFor="room-select"
              style={{
                display: 'block',
                fontWeight: 600,
                marginBottom: '0.5rem'
              }}
            >
              Conference room
            </label>
            <select
              id="room-select"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '420px',
                padding: '0.65rem 0.8rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-main)'
              }}
            >
              {ROOM_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {room === 'Others' && (
            <div style={{ marginBottom: '1rem' }}>
              <label
                htmlFor="other-room"
                style={{
                  display: 'block',
                  fontWeight: 600,
                  marginBottom: '0.5rem'
                }}
              >
                Specify room
              </label>
              <input
                id="other-room"
                type="text"
                value={otherRoom}
                onChange={(e) => setOtherRoom(e.target.value)}
                placeholder="Enter room name"
                style={{
                  width: '100%',
                  maxWidth: '420px',
                  padding: '0.65rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-main)'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label
              htmlFor="conference-time"
              style={{
                display: 'block',
                fontWeight: 600,
                marginBottom: '0.5rem'
              }}
            >
              Start time
            </label>
            <input
              id="conference-time"
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="e.g. 4:00 pm"
              style={{
                width: '100%',
                maxWidth: '220px',
                padding: '0.65rem 0.8rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-main)'
              }}
            />
          </div>

          <button
            onClick={handleCopy}
            className="btn btn-primary"
            style={{ minWidth: '140px' }}
          >
            {copied ? 'Copied!' : 'Copy Email'}
          </button>
        </>
      )}
    </div>
  );
}