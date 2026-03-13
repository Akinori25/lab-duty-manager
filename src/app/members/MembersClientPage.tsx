'use client';

import { useEffect, useMemo, useState } from 'react';
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
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const editingMember = useMemo(
    () => members.find((m) => m.id === editingId) ?? null,
    [members, editingId]
  );

  const originalResearchDate = editingMember?.overrideResearchDate
    ? new Date(editingMember.overrideResearchDate).toISOString().split('T')[0]
    : '';

  const originalPaperDate = editingMember?.overridePaperDate
    ? new Date(editingMember.overridePaperDate).toISOString().split('T')[0]
    : '';

  const protectedChanged =
    !!editingMember &&
    (
      editingMember.isActiveResearch !== isActiveResearch ||
      editingMember.isActivePaper !== isActivePaper ||
      originalResearchDate !== (overrideResearchDate || '') ||
      originalPaperDate !== (overridePaperDate || '')
    );

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
    setAdminPassword('');
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await addMember(name);
      if (!result.success) {
        alert(result.error || 'Failed to add member');
        return;
      }
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!editingId) return;

      const result = await updateMember(editingId, {
        name,
        isActiveResearch,
        isActivePaper,
        overrideResearchDate: overrideResearchDate ? new Date(overrideResearchDate) : null,
        overridePaperDate: overridePaperDate ? new Date(overridePaperDate) : null,
        absences: absences.filter(Boolean),
        adminPassword: protectedChanged ? adminPassword : undefined
      });

      if (!result.success) {
        alert(result.error || 'Update failed');
        return;
      }

      window.location.reload();
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
    setAdminPassword('');
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
    <div className="members-page">
      <div className="card members-card">
        <div className="members-header">
          <h2 className="members-title">Laboratory Members</h2>
          {!isAdding && !editingId && (
            <button className="btn btn-primary" onClick={startAdd}>
              + Add Member
            </button>
          )}
        </div>

        <div className="desktop-table-wrap">
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

        <div className="mobile-member-list">
          {members.length === 0 ? (
            <div className="mobile-empty">No members found in the database.</div>
          ) : (
            members.map((member) => (
              <div className="mobile-member-card" key={member.id}>
                <div className="mobile-member-top">
                  <div className="mobile-member-name">{member.name}</div>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem 0.8rem', fontSize: '0.85rem' }}
                    onClick={() => startEdit(member)}
                    disabled={isAdding || editingId === member.id}
                  >
                    Edit
                  </button>
                </div>

                <div className="mobile-member-grid">
                  <div className="mobile-field">
                    <div className="mobile-label">Status</div>
                    <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
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
                  </div>

                  <div className="mobile-field">
                    <div className="mobile-label">Absences</div>
                    {member.absences && member.absences.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        {member.absences.map((a: any) => (
                          <span key={a.id} className="mobile-muted">
                            {new Date(a.date).toLocaleDateString()}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="mobile-muted">None</span>
                    )}
                  </div>

                  <div className="mobile-field">
                    <div className="mobile-label">Days Since Research</div>
                    <div>
                      {member.daysSinceResearch === 10000
                        ? 'Never'
                        : `${member.daysSinceResearch} days`}
                    </div>
                  </div>

                  <div className="mobile-field">
                    <div className="mobile-label">Days Since Paper</div>
                    <div>
                      {member.daysSincePaper === 10000
                        ? 'Never'
                        : `${member.daysSincePaper} days`}
                    </div>
                  </div>

                  <div className="mobile-field">
                    <div className="mobile-label">Last Research</div>
                    <div>
                      {member.lastResearchDate
                        ? new Date(member.lastResearchDate).toLocaleDateString()
                        : 'None'}
                    </div>
                  </div>

                  <div className="mobile-field">
                    <div className="mobile-label">Last Paper</div>
                    <div>
                      {member.lastPaperDate
                        ? new Date(member.lastPaperDate).toLocaleDateString()
                        : 'None'}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {(isAdding || editingId) && (
        <div className="modal-overlay" onClick={cancelEdit}>
          <div className="member-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{isAdding ? 'Add New Member' : 'Edit Member'}</h3>
                <div className="modal-subtitle">
                  {isAdding
                    ? 'Create a new laboratory member.'
                    : 'Update member status, dates, and planned absences.'}
                </div>
              </div>

              <button
                type="button"
                onClick={cancelEdit}
                aria-label="Close modal"
                className="modal-close"
              >
                ×
              </button>
            </div>

            <form onSubmit={isAdding ? handleAdd : handleUpdate}>
              <div className="form-stack">
                <div className={`top-grid ${isAdding ? 'top-grid-add' : ''}`}>
                  <div className="panel">
                    <label className="field-label">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Enter member name"
                      className="text-input"
                    />
                  </div>

                  {!isAdding && (
                    <div className="panel panel-checkboxes">
                      <label className="checkbox-row">
                        <input
                          type="checkbox"
                          id="active-research"
                          checked={isActiveResearch}
                          onChange={(e) => setIsActiveResearch(e.target.checked)}
                          className="checkbox-input"
                        />
                        Active (Research)
                      </label>

                      <label className="checkbox-row">
                        <input
                          type="checkbox"
                          id="active-paper"
                          checked={isActivePaper}
                          onChange={(e) => setIsActivePaper(e.target.checked)}
                          className="checkbox-input"
                        />
                        Active (Paper)
                      </label>
                    </div>
                  )}
                </div>

                {!isAdding && (
                  <>
                    <div className="date-grid">
                      <div className="panel">
                        <label className="field-label">Last Research Date</label>
                        <input
                          type="date"
                          value={overrideResearchDate}
                          onChange={(e) => setOverrideResearchDate(e.target.value)}
                          className="text-input"
                        />
                      </div>

                      <div className="panel">
                        <label className="field-label">Last Paper Date</label>
                        <input
                          type="date"
                          value={overridePaperDate}
                          onChange={(e) => setOverridePaperDate(e.target.value)}
                          className="text-input"
                        />
                      </div>
                    </div>

                    <div className="panel">
                      <div className="panel-head">
                        <div>
                          <div className="panel-title">Known Absences</div>
                          <div className="panel-subtitle">
                            Register dates when this member should be excluded.
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddAbsence}
                          className="btn btn-secondary add-date-btn"
                        >
                          + Add Date
                        </button>
                      </div>

                      {absences.length > 0 && (
                        <div className="absence-chip-wrap">
                          {absences
                            .filter(Boolean)
                            .map((absenceStr, idx) => (
                              <div className="absence-chip" key={`${absenceStr}-${idx}`}>
                                <span>{absenceStr}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAbsence(idx)}
                                  className="chip-remove"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                        </div>
                      )}

                      <div className="absence-input-list">
                        {absences.map((absenceStr, idx) => (
                          <div className="absence-row" key={idx}>
                            <input
                              type="date"
                              value={absenceStr}
                              onChange={(e) => handleUpdateAbsence(idx, e.target.value)}
                              className="text-input"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveAbsence(idx)}
                              className="btn btn-secondary absence-remove-btn"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>

                      {absences.length === 0 && (
                        <div className="no-absence-note">No absences scheduled.</div>
                      )}
                    </div>

                    <div className={`panel auth-panel ${protectedChanged ? 'auth-required' : ''}`}>
                      <div className="panel-title">Admin Authorization</div>

                      <div className={`auth-message ${protectedChanged ? 'warn' : ''}`}>
                        {protectedChanged
                          ? 'Changing active status or last duty dates requires the admin password.'
                          : 'No protected fields changed. Password is not required for this update.'}
                      </div>

                      {protectedChanged && (
                        <div>
                          <label className="field-label auth-label">Admin Password</label>
                          <input
                            type="password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            placeholder="Enter admin password"
                            required={protectedChanged}
                            className="text-input auth-input"
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary action-btn"
                    onClick={cancelEdit}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary action-btn"
                    disabled={loading || (!!editingId && protectedChanged && !adminPassword.trim())}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .members-page {
          width: 100%;
        }

        .members-card {
          margin-bottom: 2rem;
        }

        .members-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .members-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-main);
          margin: 0;
        }

        .mobile-member-list {
          display: none;
        }

        .mobile-empty {
          text-align: center;
          padding: 2rem 1rem;
          color: var(--text-muted);
        }

        .mobile-member-card {
          border: 1px solid var(--border-color);
          border-radius: 16px;
          background: var(--bg-main);
          padding: 1rem;
          display: grid;
          gap: 0.9rem;
        }

        .mobile-member-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.75rem;
        }

        .mobile-member-name {
          font-weight: 700;
          color: var(--text-main);
          font-size: 1rem;
          word-break: break-word;
        }

        .mobile-member-grid {
          display: grid;
          gap: 0.8rem;
        }

        .mobile-field {
          display: grid;
          gap: 0.25rem;
        }

        .mobile-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .mobile-muted {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(3px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1.5rem;
        }

        .member-modal {
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
          background: #ffffff;
          color: #0f172a;
          border-radius: 18px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.28);
          padding: 2rem;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .modal-title {
          margin: 0;
          font-size: 1.75rem;
          font-weight: 700;
        }

        .modal-subtitle {
          margin-top: 0.35rem;
          font-size: 0.95rem;
          color: #64748b;
        }

        .modal-close {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          cursor: pointer;
          font-size: 1.4rem;
          line-height: 1;
          color: #334155;
          flex-shrink: 0;
        }

        .form-stack {
          display: grid;
          gap: 1.25rem;
        }

        .top-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
          gap: 1rem;
        }

        .top-grid-add {
          grid-template-columns: 1fr;
        }

        .date-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1rem;
        }

        .panel {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 1rem;
        }

        .panel-checkboxes {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 0.9rem;
        }

        .field-label {
          display: block;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
          color: #64748b;
          font-weight: 600;
        }

        .text-input {
          width: 100%;
          padding: 0.9rem 1rem;
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          font-size: 1rem;
        }

        .checkbox-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-weight: 600;
          color: #0f172a;
        }

        .checkbox-input {
          width: 1.1rem;
          height: 1.1rem;
          cursor: pointer;
          flex-shrink: 0;
        }

        .panel-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 0.9rem;
        }

        .panel-title {
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
        }

        .panel-subtitle {
          font-size: 0.875rem;
          color: #64748b;
          margin-top: 0.2rem;
        }

        .add-date-btn {
          padding: 0.55rem 0.9rem;
          font-size: 0.875rem;
          border-radius: 999px;
        }

        .absence-chip-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          margin-bottom: 1rem;
        }

        .absence-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem 0.7rem;
          background: #e0f2fe;
          border: 1px solid #bae6fd;
          border-radius: 999px;
          font-size: 0.875rem;
          color: #075985;
          max-width: 100%;
        }

        .chip-remove {
          border: none;
          background: transparent;
          cursor: pointer;
          color: #0c4a6e;
          font-weight: 700;
          padding: 0;
          line-height: 1;
          flex-shrink: 0;
        }

        .absence-input-list {
          display: grid;
          gap: 0.65rem;
        }

        .absence-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 0.5rem;
        }

        .absence-remove-btn {
          padding: 0.8rem 0.95rem;
          min-width: 72px;
        }

        .no-absence-note {
          font-size: 0.925rem;
          color: #64748b;
          padding: 0.8rem 0;
          border-top: 1px dashed #cbd5e1;
        }

        .auth-panel {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .auth-required {
          background: #fff7ed;
          border: 1px solid #fdba74;
        }

        .auth-message {
          font-size: 0.9rem;
          color: #64748b;
          margin-top: 0.35rem;
        }

        .auth-message.warn {
          color: #9a3412;
          margin-bottom: 0.9rem;
        }

        .auth-label {
          color: #9a3412;
        }

        .auth-input {
          border: 1px solid #fdba74;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 0.25rem;
          padding-top: 0.5rem;
        }

        .action-btn {
          padding: 0.85rem 1.35rem;
          border-radius: 12px;
        }

        @media (max-width: 900px) {
          .member-modal {
            max-width: 760px;
            padding: 1.5rem;
          }

          .top-grid {
            grid-template-columns: 1fr;
          }

          .modal-title {
            font-size: 1.45rem;
          }
        }

        @media (max-width: 720px) {
          .desktop-table-wrap {
            display: none;
          }

          .mobile-member-list {
            display: grid;
            gap: 0.9rem;
          }

          .members-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .members-header :global(.btn) {
            width: 100%;
          }

          .modal-overlay {
            padding: 0.75rem;
            align-items: flex-end;
          }

          .member-modal {
            max-width: 100%;
            max-height: 92vh;
            border-radius: 18px 18px 0 0;
            padding: 1rem;
          }

          .modal-header {
            align-items: flex-start;
          }

          .modal-title {
            font-size: 1.25rem;
          }

          .modal-subtitle {
            font-size: 0.88rem;
          }

          .date-grid {
            grid-template-columns: 1fr;
          }

          .absence-row {
            grid-template-columns: 1fr;
          }

          .absence-remove-btn {
            width: 100%;
          }

          .add-date-btn {
            width: 100%;
            justify-content: center;
          }

          .modal-actions {
            flex-direction: column-reverse;
          }

          .action-btn {
            width: 100%;
          }

          .text-input {
            font-size: 16px;
          }
        }

        @media (max-width: 480px) {
          .members-card {
            padding: 1rem;
          }

          .mobile-member-card {
            border-radius: 14px;
            padding: 0.9rem;
          }

          .mobile-member-top {
            flex-direction: column;
            align-items: stretch;
          }

          .mobile-member-top :global(.btn) {
            width: 100%;
          }

          .member-modal {
            padding: 0.9rem;
          }

          .panel {
            padding: 0.85rem;
            border-radius: 12px;
          }

          .modal-close {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
    </div>
  );
}