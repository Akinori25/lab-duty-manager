'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function DownloadMembersPdfButton({
  members
}: {
  members: any[]
}) {
  const handleDownload = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Lab Members', 14, 16);

    const rows = members.map((member: any) => [
      member.name,
      member.isActivePaper ? 'Yes' : 'No',
      member.isActiveResearch ? 'Yes' : 'No'
    ]);

    autoTable(doc, {
      startY: 24,
      head: [['Name', 'Paper Active', 'Research Active']],
      body: rows,
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [39, 174, 96]
      }
    });

    doc.save('members.pdf');
  };

  return (
    <button className="btn btn-secondary" onClick={handleDownload}>
      Download Members PDF
    </button>
  );
}