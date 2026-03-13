'use client';

import { useEffect, useState } from 'react';
import { addMember, updateMember } from '../actions/members';

export default function MembersClientPage({ initialMembers }: { initialMembers: any[] }) {
  const [members, setMembers] = useState(initialMembers);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [isActiveResearch, setIsActiveResearch] = useState(true);
  const [isActivePaper, setIsActivePaper] = useState(true);
  const [overrideResearchDate, setOverrideResearchDate] = useState('');
  const [overridePaperDate, setOverridePaperDate] = useState('');
  const [absences, setAbsences] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAddAbsence = () => setAbsences([...absences, '']);

  const handleRemoveAbsence = (index: number) => {
    const newAbs = [...absences];
    newAbs.splice(index, 1);
    setAbsences(newAbs);
  };

  const handleUpdateAbsence = (index: number, val: string) => {
    const newAbs = [...absences];
    newAbs[index] = val;
    setAbsences(newAbs);
  };

  const resetForm = () => {
    setEditingId(null);
    setIsAdding(false);
    setName('');
    setIsActiveResearch(true);
    setIsActivePaper(true);
    setOverrideResearchDate('');
    setOverridePaperDate('');
    setAbsences([]);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addMember(name);
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateMember(editingId, {
          name,
          isActiveResearch,
          isActivePaper,
          overrideResearchDate: overrideResearchDate ? new Date(overrideResearchDate) : null,
          overridePaperDate: overridePaperDate ? new Date(overridePaperDate) : null,
          absences: absences.filter(Boolean)
        });
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (member: any) => {
    setEditingId(member.id);
    setName(member.name);
    setIsActiveResearch(member.isActiveResearch);
    setIsActivePaper(member.isActivePaper);
    setOverrideResearchDate(
      member.overrideResearchDate
        ? new Date(member.overrideResearchDate).toISOString().split('T')[0]
        : ''
    );
    setOverridePaperDate(
      member.overridePaperDate
        ? new Date(member.overridePaperDate).toISOString().split('T')[0]
        : ''
    );
    setAbsences(
      member.absences
        ? member.absences.map((a: any) => new Date(a.date).toISOString().split('T')[0])
        : []
    );
    setIsAdding(false);
  };

  const startAdd = () => {
    resetForm();
    setIsAdding(true);
  };

  const cancelEdit = () => {
    resetForm();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (isAdding || editingId)) {
        cancelEdit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdding, editingId]);

  return (
    <div>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Laboratory Members
          </h2>
          {!isAdding && !editingId && (
            <button className="btn btn-primary" onClick={startAdd}>
              + Add Member
            </button>
          )}
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Absences</th>
                <th>Days Since Research</th>
                <th>Days Since Paper</th>
                <th>Last Research</th>
                <th>Last Paper</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td style={{ fontWeight: 500 }}>{member.name}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span
                        className={`badge ${
                          member.isActiveResearch ? 'badge-success' : 'badge-secondary'
                        }`}
                      >
                        {member.isActiveResearch ? 'Research' : 'No Research'}
                      </span>
                      <span
                        className={`badge ${
                          member.isActivePaper ? 'badge-success' : 'badge-secondary'
                        }`}
                      >
                        {member.isActivePaper ? 'Paper' : 'No Paper'}
                      </span>
                    </div>
                  </td>
                  <td>
                    {member.absences && member.absences.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {member.absences.map((a: any) => (
                          <span
                            key={a.id}
                            style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                          >
                            {new Date(a.date).toLocaleDateString()}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        None
                      </span>
                    )}
                  </td>
                  <td>
                    {member.daysSinceResearch === 10000
                      ? 'Never'
                      : `${member.daysSinceResearch} days`}
                  </td>
                  <td>
                    {member.daysSincePaper === 10000 ? 'Never' : `${member.daysSincePaper} days`}
                  </td>
                  <td>
                    {member.lastResearchDate
                      ? new Date(member.lastResearchDate).toLocaleDateString()
                      : 'None'}
                  </td>
                  <td>
                    {member.lastPaperDate
                      ? new Date(member.lastPaperDate).toLocaleDateString()
                      : 'None'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                      onClick={() => startEdit(member)}
                      disabled={isAdding || editingId === member.id}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {members.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No members found in the database.
            </div>
          )}
        </div>
      </div>

      {(isAdding || editingId) && (
        <div
          onClick={cancelEdit}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '820px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'var(--bg-main)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
              padding: '1.5rem'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}
            >
              <h3 style={{ margin: 0 }}>{isAdding ? 'Add New Member' : 'Edit Member'}</h3>
              <button
                type="button"
                onClick={cancelEdit}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.75rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={isAdding ? handleAdd : handleUpdate}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      marginBottom: '0.5rem',
                      color: 'var(--text-muted)'
                    }}
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)'
                    }}
                  />
                </div>

                {!isAdding && (
                  <>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '1rem'
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            marginBottom: '0.5rem',
                            color: 'var(--text-muted)'
                          }}
                        >
                          Last Research Date
                        </label>
                        <input
                          type="date"
                          value={overrideResearchDate}
                          onChange={(e) => setOverrideResearchDate(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)'
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            marginBottom: '0.5rem',
                            color: 'var(--text-muted)'
                          }}
                        >
                          Last Paper Date
                        </label>
                        <input
                          type="date"
                          value={overridePaperDate}
                          onChange={(e) => setOverridePaperDate(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                      <label
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        <input
                          type="checkbox"
                          id="active-research"
                          checked={isActiveResearch}
                          onChange={(e) => setIsActiveResearch(e.target.checked)}
                          style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer' }}
                        />
                        Active (Research)
                      </label>

                      <label
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        <input
                          type="checkbox"
                          id="active-paper"
                          checked={isActivePaper}
                          onChange={(e) => setIsActivePaper(e.target.checked)}
                          style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer' }}
                        />
                        Active (Paper)
                      </label>
                    </div>

                    <div
                      style={{
                        padding: '1rem',
                        background: 'var(--bg-light)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.75rem'
                        }}
                      >
                        <label
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: 'var(--text-main)'
                          }}
                        >
                          Known Absences
                        </label>
                        <button
                          type="button"
                          onClick={handleAddAbsence}
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          + Add Date
                        </button>
                      </div>

                      {absences.map((absenceStr, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            gap: '0.5rem',
                            marginBottom: '0.5rem'
                          }}
                        >
                          <input
                            type="date"
                            value={absenceStr}
                            onChange={(e) => handleUpdateAbsence(idx, e.target.value)}
                            style={{
                              flex: 1,
                              padding: '0.5rem',
                              borderRadius: '4px',
                              border: '1px solid var(--border-color)'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveAbsence(idx)}
                            className="btn btn-secondary"
                            style={{ padding: '0.5rem 0.75rem' }}
                          >
                            X
                          </button>
                        </div>
                      ))}

                      {absences.length === 0 && (
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                          No absences scheduled.
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '0.5rem',
                    marginTop: '0.5rem'
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={cancelEdit}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}