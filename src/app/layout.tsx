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

          <div className="content-shell">
            <header className="mobile-header">
              <div className="mobile-header-top">
                <h1 className="mobile-logo">Lab Duty Manager</h1>
              </div>
              <nav className="mobile-nav">
                <Link href="/schedule" className="mobile-nav-link">Schedule</Link>
                <Link href="/members" className="mobile-nav-link">Members</Link>
              </nav>
            </header>

            <main className="main-content">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}