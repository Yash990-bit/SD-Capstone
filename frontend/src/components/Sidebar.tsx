import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Share2, Heart, ClipboardList,
  QrCode, X, LogOut, FolderOpen, Activity,
} from 'lucide-react';
import type { User } from '../types';

interface SidebarProps {
  user: User;
  onLogout: () => void;
  open?: boolean;
  onClose?: () => void;
}

function getInitials(name: string) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

const patientNav = [
  { label: 'MAIN' },
  { path: '/dashboard',    label: 'Dashboard',       icon: <LayoutDashboard size={16} /> },
  { path: '/documents',    label: 'My Records',      icon: <FileText size={16} /> },
  { path: '/documents/upload', label: 'Share Links', icon: <Share2 size={16} /> },
  { label: 'HEALTH' },
  { path: '/health-analytics', label: 'Medical Profile', icon: <Heart size={16} /> },
  { path: '/appointments', label: 'Consultations',   icon: <ClipboardList size={16} /> },
  { path: '/emergency-access', label: 'Emergency QR', icon: <QrCode size={16} />, emergency: true },
];

const doctorNav = [
  { label: 'MAIN' },
  { path: '/dashboard',   label: 'Dashboard',      icon: <LayoutDashboard size={16} /> },
  { path: '/documents',   label: 'Shared Records', icon: <FolderOpen size={16} /> },
  { label: 'PRACTICE' },
  { path: '/appointments', label: 'Consultations', icon: <ClipboardList size={16} /> },
  { path: '/health-analytics', label: 'Analytics', icon: <Activity size={16} /> },
];

export default function Sidebar({ user, onLogout, open = true, onClose }: SidebarProps) {
  const isDoctor = user.role === 'doctor';
  const navItems = isDoctor ? doctorNav : patientNav;
  const sidebarBg = isDoctor ? '#064E3B' : 'var(--navy)';
  const activeBg  = isDoctor ? '#059669'  : 'var(--blue)';
  const logoIconBg = isDoctor ? '#059669' : 'var(--blue)';

  return (
    <>
      <aside
        className={`sidebar${open ? ' open' : ''}`}
        style={{ background: sidebarBg }}
      >
        {/* Close button (mobile) */}
        {onClose && (
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
            <X size={14} />
          </button>
        )}

        {/* Logo */}
        <div className="sidebar-logo-area">
          <div className="sidebar-logo-icon" style={{ background: logoIconBg }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="5.5" y="1" width="5" height="14" rx="2" fill="white" />
              <rect x="1" y="5.5" width="14" height="5" rx="2" fill="white" />
            </svg>
          </div>
          <span className="sidebar-logo-text">MediVault</span>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if ('label' in item && !('path' in item)) {
              return (
                <div key={i} className="sidebar-section-label">{item.label}</div>
              );
            }
            const nav = item as { path: string; label: string; icon: React.ReactNode; emergency?: boolean };
            return (
              <NavLink
                key={nav.path}
                to={nav.path}
                end={nav.path === '/dashboard'}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item${isActive ? ' active' : ''}${nav.emergency && !isActive ? ' emergency-item' : ''}`
                }
                style={({ isActive }) => isActive ? { background: activeBg, color: 'white' } : undefined}
              >
                {nav.icon}
                {nav.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom: user + logout */}
        <div>
          <button
            onClick={onLogout}
            className="sidebar-nav-item"
            style={{ margin: '0 8px 4px', width: 'calc(100% - 16px)', color: 'rgba(255,255,255,0.4)' }}
          >
            <LogOut size={15} />
            Logout
          </button>
          <div className="sidebar-bottom">
            <div className="sidebar-avatar">{getInitials(user.name)}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-role">{isDoctor ? 'Doctor' : 'Patient'}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {onClose && (
        <div
          className="sidebar-backdrop"
          style={{ display: open ? 'block' : 'none' }}
          onClick={onClose}
        />
      )}
    </>
  );
}
