import { Menu, Plus, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  title: string;
  subtitle?: string;
  onMenuToggle: () => void;
}

export default function TopBar({ title, subtitle, onMenuToggle }: TopBarProps) {
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-hamburger" onClick={onMenuToggle} aria-label="Toggle sidebar">
          <Menu size={18} />
        </button>
        <div>
          <div className="topbar-title">{title}</div>
          {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
        </div>
      </div>

      <div className="topbar-actions">
        <button
          className="topbar-btn topbar-btn-outline"
          onClick={() => navigate('/documents/upload')}
        >
          <Plus size={14} />
          <span>Upload record</span>
        </button>
        <button
          className="topbar-btn topbar-btn-primary"
          onClick={() => navigate('/documents/upload')}
        >
          <Share2 size={14} />
          <span>Share with doctor</span>
        </button>
      </div>
    </header>
  );
}
