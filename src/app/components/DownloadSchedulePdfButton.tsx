'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function DownloadSchedulePdfButton({
  schedules
}: {
  schedules: any[]
}) {
  const handleDownload = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Lab Duty Schedule', 14, 16);

    const rows: string[][] = [];

    schedules.forEach((schedule: any) => {
      const d = new Date(schedule.date);
      const dateString =
        d.getFullYear() +
        '-' +
        String(d.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(d.getDate()).padStart(2, '0');

      const paperAssignment = schedule.assignments.find((a: any) => a.role === 'PAPER');
      const researchAssignment = schedule.assignments.find((a: any) => a.role === 'RESEARCH');

      rows.push([
        dateString,
        'Paper Briefing',
        paperAssignment?.member?.name || 'Skipped'
      ]);

      rows.push([
        dateString,
        'Research Presentation',
        researchAssignment?.member?.name || 'Skipped'
      ]);
    });

    autoTable(doc, {
      startY: 24,
      head: [['Date', 'Role', 'Assigned To']],
      body: rows,
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [41, 128, 185]
      }
    });

    doc.save('schedule.pdf');
  };

  return (
    <button className="btn btn-secondary" onClick={handleDownload}>
      Download Schedule PDF
    </button>
  );
}