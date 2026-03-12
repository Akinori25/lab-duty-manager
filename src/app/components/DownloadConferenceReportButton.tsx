'use client';

function formatDate(dateInput: string | Date) {
  const d = new Date(dateInput);
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export default function DownloadConferenceReportButton({
  schedules,
  members
}: {
  schedules: any[];
  members: any[];
}) {
  const handleDownload = () => {
    const nextSchedule = schedules.length > 0 ? schedules[0] : null;

    const nextDate = nextSchedule ? formatDate(nextSchedule.date) : 'TBD';

    const nextPaper = nextSchedule?.assignments?.find((a: any) => a.role === 'PAPER');
    const nextResearch = nextSchedule?.assignments?.find((a: any) => a.role === 'RESEARCH');

    const nextPaperName = nextPaper?.member?.name ?? 'Skipped';
    const nextResearchName = nextResearch?.member?.name ?? 'Skipped';

    const scheduleRows = schedules
      .map((schedule: any) => {
        const date = formatDate(schedule.date);
        const paper = schedule.assignments.find((a: any) => a.role === 'PAPER');
        const research = schedule.assignments.find((a: any) => a.role === 'RESEARCH');

        return `
          <tr>
            <td>${escapeHtml(date)}</td>
            <td>Paper Briefing</td>
            <td>${escapeHtml(paper?.member?.name ?? 'Skipped')}</td>
          </tr>
          <tr>
            <td>${escapeHtml(date)}</td>
            <td>Research Presentation</td>
            <td>${escapeHtml(research?.member?.name ?? 'Skipped')}</td>
          </tr>
        `;
      })
      .join('');

    const memberRows = members
      .map((member: any) => {
        return `
          <tr>
            <td>${escapeHtml(member.name ?? '')}</td>
            <td>${member.isActivePaper ? 'Active' : 'Inactive'}</td>
            <td>${member.isActiveResearch ? 'Active' : 'Inactive'}</td>
          </tr>
        `;
      })
      .join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Conference Report</title>
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      margin: 40px;
      color: #111827;
      background: #ffffff;
      line-height: 1.6;
    }

    h1 {
      margin-bottom: 8px;
      font-size: 28px;
    }

    h2 {
      margin-top: 32px;
      margin-bottom: 12px;
      font-size: 20px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 6px;
    }

    .meta-box {
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 16px 18px;
      margin-top: 20px;
    }

    .meta-row {
      margin: 6px 0;
    }

    .label {
      font-weight: 700;
      display: inline-block;
      min-width: 170px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
      font-size: 14px;
    }

    th, td {
      border: 1px solid #d1d5db;
      padding: 10px 12px;
      text-align: left;
      vertical-align: top;
    }

    th {
      background: #f3f4f6;
      font-weight: 700;
    }

    .footer {
      margin-top: 40px;
      color: #6b7280;
      font-size: 12px;
    }

    @media print {
      body {
        margin: 20px;
      }
    }
  </style>
</head>
<body>
  <h1>Conference Report</h1>
  <p>Generated from Lab Duty Manager</p>

  <div class="meta-box">
    <div class="meta-row"><span class="label">Next conference date:</span> ${escapeHtml(nextDate)}</div>
    <div class="meta-row"><span class="label">Research presentation:</span> ${escapeHtml(nextResearchName)}</div>
    <div class="meta-row"><span class="label">Paper briefing:</span> ${escapeHtml(nextPaperName)}</div>
  </div>

  <h2>Schedule</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Role</th>
        <th>Assigned To</th>
      </tr>
    </thead>
    <tbody>
      ${scheduleRows || `<tr><td colspan="3">No schedule data available.</td></tr>`}
    </tbody>
  </table>

  <h2>Members</h2>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Paper</th>
        <th>Research</th>
      </tr>
    </thead>
    <tbody>
      ${memberRows || `<tr><td colspan="3">No member data available.</td></tr>`}
    </tbody>
  </table>

  <div class="footer">
    You can print this page to PDF from your browser if needed.
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'conference-report.html';
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <button className="btn btn-secondary" onClick={handleDownload}>
      Download Conference Report
    </button>
  );
}