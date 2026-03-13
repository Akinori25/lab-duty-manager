'use client';

import { useEffect, useState } from 'react';
import { addMember, updateMember } from '../actions/members';

export default function MembersClientPage({ initialMembers }: { initialMembers: any[] }) {
  const [members] = useState(initialMembers);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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

  useEffect(() => {
    if (isAdding || editingId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
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
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '900px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: '18px',
              border: '1px solid rgba(15, 23, 42, 0.08)',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.28)',
              padding: '2rem'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>
                  {isAdding ? 'Add New Member' : 'Edit Member'}
                </h3>
                <div style={{ marginTop: '0.35rem', fontSize: '0.95rem', color: '#64748b' }}>
                  {isAdding
                    ? 'Create a new laboratory member.'
                    : 'Update member status, dates, and planned absences.'}
                </div>
              </div>

              <button
                type="button"
                onClick={cancelEdit}
                aria-label="Close modal"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '1.4rem',
                  lineHeight: 1,
                  color: '#334155'
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={isAdding ? handleAdd : handleUpdate}>
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isAdding
                      ? '1fr'
                      : 'minmax(0, 1.2fr) minmax(0, 0.8fr)',
                    gap: '1rem'
                  }}
                >
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px',
                      padding: '1rem'
                    }}
                  >
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        marginBottom: '0.5rem',
                        color: '#64748b',
                        fontWeight: 600
                      }}
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Enter member name"
                      style={{
                        width: '100%',
                        padding: '0.9rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        fontSize: '1rem'
                      }}
                    />
                  </div>

                  {!isAdding && (
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '14px',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: '0.9rem'
                      }}
                    >
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          fontWeight: 600,
                          color: '#0f172a'
                        }}
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
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          fontWeight: 600,
                          color: '#0f172a'
                        }}
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
                  )}
                </div>

                {!isAdding && (
                  <>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                        gap: '1rem'
                      }}
                    >
                      <div
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '14px',
                          padding: '1rem'
                        }}
                      >
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            marginBottom: '0.5rem',
                            color: '#64748b',
                            fontWeight: 600
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
                            padding: '0.9rem 1rem',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            fontSize: '1rem'
                          }}
                        />
                      </div>

                      <div
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '14px',
                          padding: '1rem'
                        }}
                      >
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            marginBottom: '0.5rem',
                            color: '#64748b',
                            fontWeight: 600
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
                            padding: '0.9rem 1rem',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            fontSize: '1rem'
                          }}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '14px',
                        padding: '1rem'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '1rem',
                          flexWrap: 'wrap',
                          marginBottom: '0.9rem'
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: '1rem',
                              fontWeight: 700,
                              color: '#0f172a'
                            }}
                          >
                            Known Absences
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.2rem' }}>
                            Register dates when this member should be excluded.
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddAbsence}
                          className="btn btn-secondary"
                          style={{
                            padding: '0.55rem 0.9rem',
                            fontSize: '0.875rem',
                            borderRadius: '999px'
                          }}
                        >
                          + Add Date
                        </button>
                      </div>

                      {absences.length > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.6rem',
                            marginBottom: '1rem'
                          }}
                        >
                          {absences
                            .filter(Boolean)
                            .map((absenceStr, idx) => (
                              <div
                                key={`${absenceStr}-${idx}`}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  padding: '0.45rem 0.7rem',
                                  background: '#e0f2fe',
                                  border: '1px solid #bae6fd',
                                  borderRadius: '999px',
                                  fontSize: '0.875rem',
                                  color: '#075985'
                                }}
                              >
                                <span>{absenceStr}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAbsence(idx)}
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    color: '#0c4a6e',
                                    fontWeight: 700,
                                    padding: 0,
                                    lineHeight: 1
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                        </div>
                      )}

                      <div style={{ display: 'grid', gap: '0.65rem' }}>
                        {absences.map((absenceStr, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr auto',
                              gap: '0.5rem'
                            }}
                          >
                            <input
                              type="date"
                              value={absenceStr}
                              onChange={(e) => handleUpdateAbsence(idx, e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.8rem 0.95rem',
                                borderRadius: '10px',
                                border: '1px solid #cbd5e1',
                                background: '#ffffff',
                                fontSize: '0.95rem'
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveAbsence(idx)}
                              className="btn btn-secondary"
                              style={{
                                padding: '0.8rem 0.95rem',
                                minWidth: '72px'
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>

                      {absences.length === 0 && (
                        <div
                          style={{
                            fontSize: '0.925rem',
                            color: '#64748b',
                            padding: '0.8rem 0',
                            borderTop: '1px dashed #cbd5e1'
                          }}
                        >
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
                    gap: '0.75rem',
                    marginTop: '0.25rem',
                    paddingTop: '0.5rem'
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={cancelEdit}
                    disabled={loading}
                    style={{
                      padding: '0.85rem 1.25rem',
                      borderRadius: '12px'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{
                      padding: '0.85rem 1.35rem',
                      borderRadius: '12px'
                    }}
                  >
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