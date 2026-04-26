import type { ReactNode, CSSProperties } from 'react';

interface ButtonProps {
  variant?: 'primary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
  loading?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
  children: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  style?: CSSProperties;
}

const variantBase: Record<string, CSSProperties> = {
  primary: { background: 'var(--blue)', color: 'white', border: 'none' },
  outline: { background: 'white', color: 'var(--text-primary)', border: '0.5px solid var(--border)' },
  danger:  { background: 'var(--red-50)', color: 'var(--red)', border: '0.5px solid var(--red-200)' },
  ghost:   { background: 'transparent', color: 'var(--text-secondary)', border: 'none' },
};

const sizeBase: Record<string, CSSProperties> = {
  sm: { padding: '7px 12px', fontSize: 12, borderRadius: 'var(--radius-sm)' },
  md: { padding: '9px 16px', fontSize: 13, borderRadius: 'var(--radius-md)' },
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  onClick,
  children,
  type = 'button',
  disabled,
  style,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'var(--font)',
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        transition: 'opacity 0.15s',
        whiteSpace: 'nowrap',
        ...variantBase[variant],
        ...sizeBase[size],
        ...style,
      }}
    >
      {loading ? (
        <span style={{
          width: 12, height: 12, border: '2px solid currentColor',
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
          display: 'inline-block',
        }} />
      ) : icon}
      {children}
    </button>
  );
}
