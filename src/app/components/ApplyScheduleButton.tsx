'use client';

import { useState } from 'react';
import { applySchedule } from '../actions/schedule';

export default function ApplyScheduleButton() {
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    const password = prompt('Admin password');
    if (!password) return;

    const ok = confirm(
      'Apply all schedules up to today?\n\nThis will update last dates and remove past schedule records.'
    );
    if (!ok) return;

    setLoading(true);

    try {
      const result = await applySchedule(password);

      if (result.success) {
        alert('Successfully applied schedules!');
        window.location.reload();
      } else {
        alert('Failed to apply: ' + result.error);
      }
    } catch {
      alert('Unauthorized');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className="btn btn-secondary" onClick={handleApply} disabled={loading}>
      {loading ? 'Applying...' : 'Apply Schedule'}
    </button>
  );
}