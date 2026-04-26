import type { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  header?: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export default function Card({ children, header, style, className }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--white)',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {header && (
        <div style={{
          padding: '16px 20px',
          borderBottom: '0.5px solid var(--border)',
        }}>
          {header}
        </div>
      )}
      {children}
    </div>
  );
}
