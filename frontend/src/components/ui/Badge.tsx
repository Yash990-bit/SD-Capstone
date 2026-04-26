interface BadgeProps {
  variant: 'blue' | 'green' | 'amber' | 'purple' | 'red' | 'gray';
  label: string;
}

const variantStyles: Record<BadgeProps['variant'], React.CSSProperties> = {
  blue:   { background: 'var(--blue-50)',   color: 'var(--blue)',   border: '0.5px solid var(--blue-200)' },
  green:  { background: 'var(--green-50)',  color: 'var(--green)',  border: '0.5px solid var(--green-200)' },
  amber:  { background: 'var(--amber-50)',  color: 'var(--amber)',  border: '0.5px solid var(--amber-200)' },
  purple: { background: 'var(--purple-50)', color: 'var(--purple)', border: '0.5px solid #DDD6FE' },
  red:    { background: 'var(--red-50)',    color: 'var(--red)',    border: '0.5px solid var(--red-200)' },
  gray:   { background: '#F1F5F9',          color: '#64748B',       border: '0.5px solid var(--border)' },
};

export default function Badge({ variant, label }: BadgeProps) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '100px',
      fontSize: 11,
      fontWeight: 600,
      whiteSpace: 'nowrap',
      ...variantStyles[variant],
    }}>
      {label}
    </span>
  );
}
