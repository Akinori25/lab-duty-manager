'use client';

import { useState } from 'react';
import { seedDatabase } from '../actions/seed';

export default function SeedButton() {
  const [loading, setLoading] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    const result = await seedDatabase();
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message);
    }
    setLoading(false);
  };

  return (
    <button 
      className="btn btn-primary" 
      onClick={handleSeed}
      disabled={loading}
    >
      {loading ? 'Seeding...' : 'Seed Sample Members'}
    </button>
  );
}
