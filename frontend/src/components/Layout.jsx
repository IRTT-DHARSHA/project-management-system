import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';

export default function Layout() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className={`app-shell ${navOpen ? 'nav-open' : ''}`}>
      <Sidebar onNavigate={() => setNavOpen(false)} />
      <div className="app-main">
        <Navbar onToggleNav={() => setNavOpen((v) => !v)} />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
