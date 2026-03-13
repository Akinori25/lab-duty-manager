import './globals.css';
import AppNav from './components/AppNav';

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
            <AppNav />
          </nav>

          <div className="content-shell">
            <header className="mobile-header">
              <div className="mobile-header-top">
                <h1 className="mobile-logo">Lab Duty Manager</h1>
              </div>
              <AppNav />
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