import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'Lab Duty Manager',
  description: 'Manage Research & Paper presentation duties.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <div className="layout">
          <nav className="sidebar">
            <h1 className="logo">Lab Duty Manager</h1>
            <ul className="nav-links">
              <li><Link href="/schedule">Schedule</Link></li>
              <li><Link href="/members">Members</Link></li>
            </ul>
          </nav>
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
