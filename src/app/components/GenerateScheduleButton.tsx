'use client';

import { useState } from 'react';
import { generateSchedules } from '../actions/schedule';

export default function GenerateScheduleButton() {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateSchedules(8);
    if (result.success) {
      alert("Successfully generated schedules!");
    } else {
      alert("Failed to generate: " + result.error);
    }
    setLoading(false);
  };

  return (
    <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
      {loading ? 'Generating...' : 'Generate Next 8 Weeks'}
    </button>
  );
}
