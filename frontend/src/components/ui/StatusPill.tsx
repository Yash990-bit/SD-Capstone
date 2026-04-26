type PillVariant = 'active' | 'expired' | 'warning';

interface StatusPillProps {
  label: string;
  variant: PillVariant;
}

const styles: Record<PillVariant, { dot: string; text: string; bg: string; border: string }> = {
  active:  { dot: 'var(--green)',  text: 'var(--green)',  bg: 'var(--green-50)',  border: 'var(--green-200)' },
  expired: { dot: 'var(--red)',    text: 'var(--red)',    bg: 'var(--red-50)',    border: 'var(--red-200)' },
  warning: { dot: 'var(--amber)',  text: 'var(--amber)',  bg: 'var(--amber-50)',  border: 'var(--amber-200)' },
};

export default function StatusPill({ label, variant }: StatusPillProps) {
  const s = styles[variant];
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 10px',
      borderRadius: 100,
      background: s.bg,
      border: `0.5px solid ${s.border}`,
      fontSize: 12,
      fontWeight: 600,
      color: s.text,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {label}
    </span>
  );
}
