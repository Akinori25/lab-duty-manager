'use client';

import { useState } from 'react';
import { addSkipDate, removeSkipDate } from '../actions/skipDates';

export default function SkipDatesManager({ initialSkipDates }: { initialSkipDates: any[] }) {
  const [skipDates, setSkipDates] = useState(initialSkipDates);
  const [isAdding, setIsAdding] = useState(false);
  const [dateStr, setDateStr] = useState('');
  const [skipResearch, setSkipResearch] = useState(false);
  const [skipPaper, setSkipPaper] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateStr) return;
    setLoading(true);
    await addSkipDate(dateStr, skipResearch, skipPaper);
    window.location.reload();
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    await removeSkipDate(id);
    window.location.reload();
  };

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>Manage Skip Dates</h2>
        {!isAdding && (
          <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
            + Add Skip Rule
          </button>
        )}
      </div>

      {isAdding && (
        <form 
          onSubmit={handleAdd} 
          style={{ 
            background: 'var(--bg-light)', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            border: '1px solid var(--border-color)'
          }}
        >
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 'min-content' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Date</label>
              <input 
                type="date" 
                value={dateStr} 
                onChange={(e) => setDateStr(e.target.value)} 
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '45px' }}>
              <input 
                type="checkbox" 
                id="skip-research"
                checked={skipResearch}
                onChange={(e) => setSkipResearch(e.target.checked)}
                style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
              />
              <label htmlFor="skip-research" style={{ cursor: 'pointer', fontWeight: 500 }}>Skip Research</label>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '45px' }}>
              <input 
                type="checkbox" 
                id="skip-paper"
                checked={skipPaper}
                onChange={(e) => setSkipPaper(e.target.checked)}
                style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
              />
              <label htmlFor="skip-paper" style={{ cursor: 'pointer', fontWeight: 500 }}>Skip Paper</label>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Rule'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setIsAdding(false)}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {skipDates.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {skipDates.map((sd: any) => (
            <div key={sd.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-main)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontWeight: 600, marginRight: '1rem' }}>
                  {new Date(sd.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className={`badge ${sd.isResearchSkipped ? 'badge-primary' : 'badge-secondary'}`} style={{ marginRight: '0.5rem' }}>
                  Research: {sd.isResearchSkipped ? 'Skipped' : 'Normal'}
                </span>
                <span className={`badge ${sd.isPaperSkipped ? 'badge-primary' : 'badge-secondary'}`}>
                  Paper: {sd.isPaperSkipped ? 'Skipped' : 'Normal'}
                </span>
              </div>
              <button className="btn btn-secondary" onClick={() => handleDelete(sd.id)} disabled={loading} style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem' }}>
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)' }}>No skip rules have been created.</p>
      )}
    </div>
  );
}
