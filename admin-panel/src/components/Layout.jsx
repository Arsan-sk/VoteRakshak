/**
 * Admin Panel Sidebar Layout
 */

import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
    { to: '/admin', icon: '📊', label: 'Dashboard', end: true },
    { to: '/admin/elections', icon: '🗳️', label: 'Elections' },
    { to: '/admin/students', icon: '👥', label: 'Students' },
    { to: '/admin/blos', icon: '🏢', label: 'BLO Management' },
    { to: '/admin/results', icon: '🏆', label: 'Results' },
];

function Layout() {
    const navigate = useNavigate();

    function handleLogout() {
        localStorage.removeItem('adminToken');
        navigate('/');
    }

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-brand">
                    <h1>🗳️ VoteRakshak</h1>
                    <p>Admin Panel · Phase 2</p>
                </div>

                <nav className="sidebar-nav">
                    {NAV_ITEMS.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <span className="icon">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="nav-item" onClick={handleLogout} style={{ width: '100%', background: 'rgba(239,68,68,0.1)', color: '#fca5a5' }}>
                        <span className="icon">🔓</span>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;
