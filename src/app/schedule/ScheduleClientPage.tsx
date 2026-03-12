'use client';

export default function ScheduleClientPage({ 
  schedules 
}: { 
  schedules: any[] 
}) {


  return (
    <div className="table-container">
      
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Role</th>
            <th>Assigned To</th>
          </tr>
        </thead>
        <tbody>
          {schedules.length === 0 ? (
            <tr>
              <td colSpan={3} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                No assignments to display here.
              </td>
            </tr>
          ) : (
            schedules.map((schedule: any) => {
              const dateString = new Date(schedule.date).toLocaleDateString(undefined, {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              });
              
              // Normalize data: pick out exactly one assignment per role, if it exists
              const paperAssignment = schedule.assignments.find((a: any) => a.role === 'PAPER');
              const researchAssignment = schedule.assignments.find((a: any) => a.role === 'RESEARCH');

              return (
                <optgroup key={schedule.id} label={dateString} style={{ display: 'contents' }}>
                  {/* Stable Row 1: Paper Briefing with rowSpan=2 for the Date */}
                  <tr style={{ borderTop: '1px solid var(--border-color)' }}>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)', verticalAlign: 'top', paddingTop: '1rem' }} rowSpan={2}>
                      {dateString}
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      📄 Paper Briefing
                    </td>
                    <td>
                      {paperAssignment ? (
                        <span>{paperAssignment.member?.name || 'Unknown'}</span>
                      ) : (
                        <span className="badge badge-secondary" style={{ backgroundColor: 'var(--bg-main)' }}>Skipped</span>
                      )}
                    </td>
                  </tr>
                  
                  {/* Stable Row 2: Research Presentation */}
                  <tr>
                    <td style={{ fontWeight: 500 }}>
                      🔬 Research Presentation
                    </td>
                    <td>
                      {researchAssignment ? (
                        <span>{researchAssignment.member?.name || 'Unknown'}</span>
                      ) : (
                        <span className="badge badge-secondary" style={{ backgroundColor: 'var(--bg-main)' }}>Skipped</span>
                      )}
                    </td>
                  </tr>
                </optgroup>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
